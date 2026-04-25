import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { uploadProfilePhoto, updateProfile } from '../../services/api/auth.api';
import ErrorModal from '../../components/ErrorModal';
import SuccessModal from '../../components/SuccessModal';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  // Show current server photo or a newly picked (not-yet-uploaded) local preview
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profilePhoto || null);
  const [pendingLocalUri, setPendingLocalUri] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const localUri = result.assets[0].uri;
      // Show preview immediately
      setPhotoUri(localUri);
      setPendingLocalUri(localUri);

      // Upload to server in background
      setIsUploadingPhoto(true);
      try {
        const serverUrl = await uploadProfilePhoto(localUri);
        // Update store with the Cloudinary URL so all screens see it
        if (user) {
          setUser({ ...user, profilePhoto: serverUrl });
        }
        setPhotoUri(serverUrl);
        setPendingLocalUri(null);
      } catch (err: any) {
        Alert.alert('Upload Failed', err.message || 'Could not upload photo. It will be saved locally.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      const updatedUser = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
      });

      // Sync updated user into the store so all screens reflect the change
      setUser({ ...updatedUser, profilePhoto: user?.profilePhoto });

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F6F9FB]">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-[#EEF2F7] flex-row items-center gap-3">
        <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace("/(Tabs)/profile")} className="p-1">
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </Pressable>
        <Text className="text-[18px] font-bold text-[#111827]">Edit Profile</Text>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Picture */}
        <View className="items-center mb-6">
          <View>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-[#0A8F83] items-center justify-center">
                <Text className="text-white text-[32px] font-semibold">
                  {fullName.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            )}
            {isUploadingPhoto && (
              <View
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <ActivityIndicator color="#FFFFFF" size="small" />
              </View>
            )}
          </View>

          <Pressable className="mt-3" onPress={handleChangePhoto} disabled={isUploadingPhoto}>
            <Text className="text-[#0A8F83] text-[14px] font-semibold">
              {isUploadingPhoto ? 'Uploading...' : 'Change Photo'}
            </Text>
          </Pressable>
        </View>

        {/* Full Name */}
        <View className="mb-4">
          <Text className="text-[#374151] text-[14px] font-semibold mb-2">Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[15px]"
          />
        </View>

        {/* Email */}
        <View className="mb-4">
          <Text className="text-[#374151] text-[14px] font-semibold mb-2">Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[15px]"
          />
        </View>

        {/* Phone Number */}
        <View className="mb-6">
          <Text className="text-[#374151] text-[14px] font-semibold mb-2">Phone Number</Text>
          <TextInput
            value={phone}
            editable={false}
            className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[15px] text-[#9CA3AF]"
          />
          <Text className="text-[#9CA3AF] text-[12px] mt-1">Phone number cannot be changed</Text>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isLoading || isUploadingPhoto}
          className={`py-4 rounded-xl items-center ${
            isLoading || isUploadingPhoto ? 'bg-[#0A8F83]/50' : 'bg-[#0A8F83]'
          }`}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-[16px] font-semibold">Save Changes</Text>
          )}
        </Pressable>
      </ScrollView>

      <ErrorModal visible={!!errorMessage} message={errorMessage} onClose={() => setErrorMessage('')} />
      <SuccessModal visible={!!successMessage} message={successMessage} onClose={() => setSuccessMessage('')} />
    </View>
  );
}
