import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export interface PickedAsset {
  uri: string;
  fileName: string | null;
  type: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  quality?: number;
  aspect?: [number, number];
  allowsMultipleSelection?: boolean;
}

/**
 * Pick an image from the device's media library
 * @param options Configuration options for the image picker
 * @returns The picked image asset or null if cancelled/failed
 */
export async function pickImageFromLibrary(
  options: ImagePickerOptions = {}
): Promise<PickedAsset | null> {
  try {
    // 1. Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Permission needed',
          'Photo library permission is required to pick an image.'
        );
      }
      return null;
    }

    // 2. Launch system gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: options.allowsEditing ?? true,
      quality: options.quality ?? 0.8,
      aspect: options.aspect,
      allowsMultipleSelection: options.allowsMultipleSelection ?? false,
    });

    if (result.canceled) {
      return null;
    }

    // 3. Extract asset data
    const asset = result.assets[0];

    return {
      uri: asset.uri,
      fileName: asset.fileName || `image_${Date.now()}.jpg`,
      type: asset.type || 'image',
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
    };
  } catch (error) {
    console.error('Error picking image from library:', error);
    if (Platform.OS !== 'web') {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
    return null;
  }
}

/**
 * Take a photo using the device's camera
 * @param options Configuration options for the camera
 * @returns The captured image asset or null if cancelled/failed
 */
export async function takePhoto(
  options: ImagePickerOptions = {}
): Promise<PickedAsset | null> {
  try {
    // 1. Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Permission needed',
          'Camera permission is required to take photos.'
        );
      }
      return null;
    }

    // 2. Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options.allowsEditing ?? true,
      quality: options.quality ?? 0.8,
      aspect: options.aspect,
    });

    if (result.canceled) {
      return null;
    }

    // 3. Extract asset data
    const asset = result.assets[0];

    return {
      uri: asset.uri,
      fileName: asset.fileName || `photo_${Date.now()}.jpg`,
      type: asset.type || 'image',
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
    };
  } catch (error) {
    console.error('Error taking photo:', error);
    if (Platform.OS !== 'web') {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
    return null;
  }
}

/**
 * Pick a video from the device's media library
 * @param options Configuration options for the video picker
 * @returns The picked video asset or null if cancelled/failed
 */
export async function pickVideoFromLibrary(
  options: ImagePickerOptions = {}
): Promise<PickedAsset | null> {
  try {
    // 1. Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Permission needed',
          'Photo library permission is required to pick a video.'
        );
      }
      return null;
    }

    // 2. Launch system gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: options.allowsEditing ?? false,
      quality: options.quality ?? 0.8,
    });

    if (result.canceled) {
      return null;
    }

    // 3. Extract asset data
    const asset = result.assets[0];

    return {
      uri: asset.uri,
      fileName: asset.fileName || `video_${Date.now()}.mp4`,
      type: asset.type || 'video',
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      fileSize: asset.fileSize,
    };
  } catch (error) {
    console.error('Error picking video from library:', error);
    if (Platform.OS !== 'web') {
      Alert.alert('Error', 'Failed to pick video. Please try again.');
    }
    return null;
  }
}

/**
 * Show action sheet to choose between camera and gallery
 * @param options Configuration options for the image picker
 * @returns The picked/captured image asset or null if cancelled/failed
 */
export async function showImagePickerOptions(
  options: ImagePickerOptions = {}
): Promise<PickedAsset | null> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      // On web, directly pick from library
      pickImageFromLibrary(options).then(resolve);
      return;
    }

    Alert.alert(
      'Choose Image Source',
      'Select where you want to pick the image from',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await takePhoto(options);
            resolve(result);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await pickImageFromLibrary(options);
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ]
    );
  });
}
