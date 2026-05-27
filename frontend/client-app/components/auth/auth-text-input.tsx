import type { TextInputProps } from 'react-native';
import { Text, TextInput, View } from 'react-native';

type AuthTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  helperText?: string;
};

export function AuthTextInput({ label, error, helperText, ...props }: AuthTextInputProps) {
  return (
    <View>
      {label ? <Text className="mb-2 text-xs font-semibold uppercase tracking-[1px] text-[#64748B]">{label}</Text> : null}
      <TextInput
        className={`h-12 rounded-2xl border bg-white px-4 text-base text-[#1A1A1A] ${
          error ? 'border-[#DC2626] bg-[#FEF2F2]' : 'border-[#CBD5E1]'
        }`}
        placeholderTextColor="#8A8A8A"
        {...props}
      />
      {error ? (
        <Text className="mt-1 text-xs font-semibold text-[#DC2626]">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-[#64748B]">{helperText}</Text>
      ) : null}
    </View>
  );
}
