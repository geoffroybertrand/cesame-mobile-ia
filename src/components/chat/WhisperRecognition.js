/**
 * WhisperRecognition - Reconnaissance vocale avec Whisper.rn
 * Approche simple : enregistrement puis transcription
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { initWhisper } from 'whisper.rn';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Audio } from 'expo-av';

const WhisperRecognition = ({ isActive, onResult, onError }) => {
  const whisperRef = useRef(null);
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    // Initialiser Whisper au montage
    const initializeWhisper = async () => {
      try {
        console.log('[Whisper] Initializing...');

        // Charger le modèle depuis les assets
        const asset = Asset.fromModule(require('../../../assets/models/ggml-base.bin'));
        await asset.downloadAsync();

        console.log('[Whisper] Asset loaded:', asset.localUri);

        let modelPath = asset.localUri;

        // Sur Android, copier le fichier si nécessaire
        if (Platform.OS === 'android' && !modelPath.startsWith('file://')) {
          const targetPath = `${FileSystem.documentDirectory}ggml-base.bin`;

          const fileInfo = await FileSystem.getInfoAsync(targetPath);
          if (!fileInfo.exists) {
            console.log('[Whisper] Copying model to:', targetPath);
            await FileSystem.copyAsync({
              from: asset.localUri,
              to: targetPath,
            });
          }
          modelPath = targetPath;
        }

        console.log('[Whisper] Model path:', modelPath);

        whisperRef.current = await initWhisper({
          filePath: modelPath,
        });
        console.log('[Whisper] Initialized successfully');
      } catch (error) {
        console.error('[Whisper] Initialization error:', error);
        onError && onError(`Impossible d'initialiser Whisper: ${error.message}`);
      }
    };

    initializeWhisper();

    return () => {
      // Cleanup
      if (recordingRef.current) {
        try {
          recordingRef.current.stopAndUnloadAsync();
        } catch (e) {
          console.log('[Whisper] Cleanup error:', e);
        }
      }
    };
  }, []);

  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Permission Microphone',
            message: 'Cette application a besoin d\'accéder au microphone pour la dictée vocale.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Refuser',
            buttonPositive: 'Autoriser',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[Whisper] Microphone permission granted');
          return true;
        } else {
          console.log('[Whisper] Microphone permission denied');
          onError && onError('Permission microphone refusée');
          return false;
        }
      } catch (err) {
        console.error('[Whisper] Permission error:', err);
        onError && onError('Erreur lors de la demande de permission microphone');
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    if (!whisperRef.current) {
      console.log('[Whisper] Context not ready');
      return;
    }

    if (isTranscribing) {
      console.log('[Whisper] Cannot start recording: transcription in progress');
      return;
    }

    // Demander la permission microphone
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      console.log('[Whisper] Starting recording...');

      // Configurer l'audio
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Créer l'enregistrement avec format WAV compatible Whisper
      // IMPORTANT: Whisper nécessite 16kHz mono pour une meilleure reconnaissance
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {},
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      recordingRef.current = recording;
      setIsRecording(true);
      console.log('[Whisper] Recording started');
    } catch (error) {
      console.error('[Whisper] Start recording error:', error);
      onError && onError(error.message);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      console.log('[Whisper] No recording to stop');
      return;
    }

    try {
      console.log('[Whisper] Stopping recording...');
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        console.log('[Whisper] Recording saved to:', uri);

        // Transcrire l'audio
        console.log('[Whisper] Transcribing...');
        setIsTranscribing(true);

        const { promise } = whisperRef.current.transcribe(uri, {
          language: 'fr',
          temperature: 0.0,
          temperature_inc: 0.2,
          suppressNonSpeechTokens: true,
          prompt: 'Bonjour. Salut. Comment allez-vous? Merci beaucoup.',
          noContext: true,
        });
        const result = await promise;

        setIsTranscribing(false);
        console.log('[Whisper] Transcription result:', result);

        if (result && result.result) {
          let text = result.result.trim();

          // Retirer les tags de musique si présents
          text = text.replace(/\[Musique\]/gi, '').replace(/\(Musique\)/gi, '').trim();

          if (text && text !== '.' && text !== '...' && text !== '...') {
            console.log('[Whisper] Valid transcription:', text);
            onResult && onResult(text, true);
          } else {
            console.log('[Whisper] Empty or silence detected');
            onError && onError('Aucune parole détectée. Réessayez.');
          }
        }
      }
    } catch (error) {
      console.error('[Whisper] Stop recording error:', error);
      setIsTranscribing(false);
      onError && onError(error.message);
    }
  };

  useEffect(() => {
    if (isActive && !isRecording) {
      startRecording();
    } else if (!isActive && isRecording) {
      stopRecording();
    }
  }, [isActive]);

  return null; // Composant invisible
};

export default WhisperRecognition;
