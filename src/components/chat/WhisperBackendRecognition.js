/**
 * WhisperBackendRecognition - Reconnaissance vocale via backend MacBook
 * Envoie l'audio au serveur Whisper qui tourne sur le MacBook
 */

import React, { useEffect, useRef, useState } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';

// URL du serveur Whisper (configuré dans app.json)
const WHISPER_SERVER_URL = Constants.expoConfig?.extra?.whisperServerUrl || 'http://192.168.0.43:3002';

const WhisperBackendRecognition = ({ isActive, onResult, onError }) => {
  const recordingRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

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
          console.log('[WhisperBackend] Microphone permission granted');
          return true;
        } else {
          console.log('[WhisperBackend] Microphone permission denied');
          onError && onError('Permission microphone refusée');
          return false;
        }
      } catch (err) {
        console.error('[WhisperBackend] Permission error:', err);
        onError && onError('Erreur lors de la demande de permission microphone');
        return false;
      }
    }
    return true;
  };

  const startRecording = async () => {
    if (isTranscribing) {
      console.log('[WhisperBackend] Cannot start recording: transcription in progress');
      return;
    }

    // Demander la permission microphone
    const hasPermission = await requestMicrophonePermission();
    if (!hasPermission) {
      return;
    }

    try {
      console.log('[WhisperBackend] Starting recording...');

      // Configurer l'audio
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Créer l'enregistrement avec format WAV compatible Whisper
      // IMPORTANT: Whisper nécessite 16kHz mono
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
      console.log('[WhisperBackend] Recording started');
    } catch (error) {
      console.error('[WhisperBackend] Start recording error:', error);
      onError && onError(error.message);
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) {
      console.log('[WhisperBackend] No recording to stop');
      return;
    }

    try {
      console.log('[WhisperBackend] Stopping recording...');
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (uri) {
        console.log('[WhisperBackend] Recording saved to:', uri);

        // Envoyer l'audio au serveur Whisper
        console.log('[WhisperBackend] Sending to server:', WHISPER_SERVER_URL);
        setIsTranscribing(true);

        try {
          // Créer FormData pour l'upload
          const formData = new FormData();
          formData.append('audio', {
            uri,
            type: 'audio/wav',
            name: 'recording.wav',
          });

          // Envoyer au serveur
          const response = await fetch(`${WHISPER_SERVER_URL}/transcribe`, {
            method: 'POST',
            body: formData,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          setIsTranscribing(false);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('[WhisperBackend] Server error:', response.status, errorText);
            onError && onError(`Erreur serveur: ${response.status}`);
            return;
          }

          const result = await response.json();
          console.log('[WhisperBackend] Transcription result:', result);

          if (result.text) {
            const text = result.text.trim();
            if (text && text !== '.' && text !== '...' && text !== '...') {
              console.log('[WhisperBackend] Valid transcription:', text);
              onResult && onResult(text, true);
            } else {
              console.log('[WhisperBackend] Empty or silence detected');
              onError && onError('Aucune parole détectée. Réessayez.');
            }
          }
        } catch (fetchError) {
          setIsTranscribing(false);
          console.error('[WhisperBackend] Network error:', fetchError);
          onError && onError('Impossible de contacter le serveur Whisper');
        }
      }
    } catch (error) {
      console.error('[WhisperBackend] Stop recording error:', error);
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

export default WhisperBackendRecognition;
