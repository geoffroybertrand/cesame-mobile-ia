/**
 * SpeechRecognition - Reconnaissance vocale avec Web Speech API
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const SpeechRecognition = ({ onResult, onError, isActive }) => {
  const webViewRef = useRef(null);

  const HTML_CONTENT = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <script>
          let recognition = null;

          // Log function
          function log(message) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'log',
              message: message
            }));
          }

          log('WebView loaded');

          // Initialiser la reconnaissance vocale
          if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            log('Speech recognition API found');
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.lang = 'fr-FR';
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.maxAlternatives = 1;

            recognition.onstart = function() {
              log('Recognition started');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'started'
              }));
            };

            recognition.onresult = function(event) {
              log('Got result: ' + event.results.length);
              const transcript = event.results[0][0].transcript;
              const isFinal = event.results[0].isFinal;

              log('Transcript: ' + transcript + ', isFinal: ' + isFinal);

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'result',
                transcript: transcript,
                isFinal: isFinal
              }));
            };

            recognition.onerror = function(event) {
              log('Recognition error: ' + event.error);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: event.error
              }));
            };

            recognition.onend = function() {
              log('Recognition ended');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'end'
              }));
            };
          } else {
            log('Speech recognition NOT supported');
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              error: 'Speech recognition not supported'
            }));
          }

          // Écouter les messages de React Native
          window.addEventListener('message', function(event) {
            log('Received message from RN: ' + event.data);
            try {
              const data = JSON.parse(event.data);

              if (data.action === 'start' && recognition) {
                log('Starting recognition...');
                recognition.start();
              } else if (data.action === 'stop' && recognition) {
                log('Stopping recognition...');
                recognition.stop();
              }
            } catch (e) {
              log('Error parsing message: ' + e.message);
            }
          });

          log('Script initialized');
        </script>
      </body>
    </html>
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'log') {
        console.log('[SpeechRecognition WebView]', data.message);
      } else if (data.type === 'result') {
        console.log('[SpeechRecognition] Result:', data.transcript, 'Final:', data.isFinal);
        onResult && onResult(data.transcript, data.isFinal);
      } else if (data.type === 'error') {
        console.log('[SpeechRecognition] Error:', data.error);
        onError && onError(data.error);
      } else if (data.type === 'started') {
        console.log('[SpeechRecognition] Started');
      } else if (data.type === 'end') {
        console.log('[SpeechRecognition] Ended');
      }
    } catch (error) {
      console.error('Error parsing speech recognition message:', error);
    }
  };

  React.useEffect(() => {
    if (webViewRef.current) {
      const action = isActive ? 'start' : 'stop';
      webViewRef.current.postMessage(JSON.stringify({ action }));
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: HTML_CONTENT }}
        style={styles.webview}
        onMessage={handleMessage}
        androidHardwareAccelerationDisabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        originWhitelist={['*']}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[SpeechRecognition] WebView error:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('[SpeechRecognition] HTTP error:', nativeEvent);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: -1000,
    left: 0,
    width: 1,
    height: 1,
  },
  webview: {
    width: 1,
    height: 1,
  },
});

export default SpeechRecognition;
