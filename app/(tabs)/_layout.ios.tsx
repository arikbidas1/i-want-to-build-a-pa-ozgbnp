
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="(home)">
        <Label>Checklist</Label>
        <Icon sf={{ default: 'airplane', selected: 'airplane' }} drawable="flight" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
