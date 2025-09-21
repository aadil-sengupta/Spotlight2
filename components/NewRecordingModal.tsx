import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import * as Animatable from 'react-native-animatable';

interface NewRecordingModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NewRecordingModal({ visible, onClose }: NewRecordingModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <Animatable.View 
        animation="fadeInUp" 
        duration={300}
        style={styles.modalContainer}
      >
        {/* Empty modal content for now */}
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
