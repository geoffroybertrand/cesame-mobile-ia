/**
 * LoadingScreen - Écran de chargement initial
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
  },
});

export default LoadingScreen;
