import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';

export function AuthTextInput(props: TextInputProps) {
  return (
    <TextInput
      className="h-12 rounded-full border border-[#B8B8B8] bg-white px-5 text-base text-[#1A1A1A]"
      placeholderTextColor="#8A8A8A"
      {...props}
    />
  );
}
