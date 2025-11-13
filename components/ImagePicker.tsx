import { View, TouchableOpacity, Text, StyleSheet, Modal, Platform } from 'react-native';
import { Camera, X, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onCancel: () => void;
  visible: boolean;
}

export function ImagePickerModal({ onImageSelected, onCancel, visible }: ImagePickerProps) {
  const handleSelectFromGallery = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            onImageSelected(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Choose Profile Picture</Text>
            <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
              <X size={24} color="#1F2937" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.option}
            onPress={handleSelectFromGallery}
            activeOpacity={0.7}
          >
            <ImageIcon size={24} color="#1F2937" strokeWidth={2} />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.option, styles.cancelOption]}
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelOption: {
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
});
