
import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors } from "@/styles/commonStyles";
import { Stack, useRouter } from "expo-router";

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  requiresCall?: boolean;
  phoneNumber?: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

const INITIAL_CHECKLIST_DATA: ChecklistSection[] = [
  {
    id: "planning",
    title: "Planning stage",
    items: [
      { id: "p1", text: "Gendec", checked: false },
      { id: "p2", text: "FRAT", checked: true },
      { id: "p3", text: "Trip sheet", checked: true },
      { id: "p4", text: "Flight plan", checked: true },
    ],
  },
  {
    id: "before-flight",
    title: "Before flight",
    items: [
      { id: "b1", text: "Call CA", checked: true, requiresCall: true, phoneNumber: "+1234567890" },
      { id: "b2", text: "Check Slack messages", checked: true },
      { id: "b3", text: "VOR/ Scale check", checked: true },
      { id: "b4", text: "Passengers verified", checked: true },
      { id: "b5", text: "MX Status/MELs", checked: true },
      { id: "b6", text: "Tier 1 release", checked: true },
      { id: "b7", text: "W&B", checked: true },
    ],
  },
  {
    id: "mid-flight",
    title: "Mid-flight",
    items: [
      { id: "m1", text: "Contact FBO", checked: false },
      { id: "m2", text: "Expenses", checked: false },
    ],
  },
  {
    id: "after-landing",
    title: "After landing",
    items: [
      { id: "a1", text: "Slack summary", checked: false },
      { id: "a2", text: "Log flight", checked: false },
      { id: "a3", text: "Log MX issues", checked: false },
      { id: "a4", text: "Call CA", checked: false, requiresCall: true, phoneNumber: "+1234567890" },
    ],
  },
];

export default function EditChecklistScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<ChecklistSection[]>(INITIAL_CHECKLIST_DATA);

  const handleBack = () => {
    console.log("User tapped Back button");
    router.back();
  };

  const handleItemTextChange = (sectionId: string, itemId: string, newText: string) => {
    console.log("User editing item text:", itemId, newText);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, text: newText } : item
              ),
            }
          : section
      )
    );
  };

  const handlePhoneNumberChange = (sectionId: string, itemId: string, newPhone: string) => {
    console.log("User editing phone number:", itemId, newPhone);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, phoneNumber: newPhone } : item
              ),
            }
          : section
      )
    );
  };

  const handleToggleCall = (sectionId: string, itemId: string) => {
    console.log("User toggled call requirement for item:", itemId);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      requiresCall: !item.requiresCall,
                      phoneNumber: !item.requiresCall ? item.phoneNumber || "" : item.phoneNumber,
                    }
                  : item
              ),
            }
          : section
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="chevron.left"
            android_material_icon_name="arrow-back"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Checklist</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Sections */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            {section.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                {/* Item Text Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Task</Text>
                  <TextInput
                    style={styles.textInput}
                    value={item.text}
                    onChangeText={(text) => handleItemTextChange(section.id, item.id, text)}
                    placeholder="Enter task description"
                    placeholderTextColor={colors.textSecondary}
                    multiline
                  />
                </View>

                {/* Call Toggle */}
                <TouchableOpacity
                  style={styles.toggleContainer}
                  onPress={() => handleToggleCall(section.id, item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.toggleLeft}>
                    <IconSymbol
                      ios_icon_name="phone.fill"
                      android_material_icon_name="phone"
                      size={20}
                      color={item.requiresCall ? colors.primary : colors.textSecondary}
                    />
                    <Text style={styles.toggleLabel}>Requires Phone Call</Text>
                  </View>
                  <View style={[styles.toggle, item.requiresCall && styles.toggleActive]}>
                    <View style={[styles.toggleThumb, item.requiresCall && styles.toggleThumbActive]} />
                  </View>
                </TouchableOpacity>

                {/* Phone Number Input (only if requiresCall is true) */}
                {item.requiresCall && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={item.phoneNumber || ""}
                      onChangeText={(text) => handlePhoneNumberChange(section.id, item.id, text)}
                      placeholder="Enter phone number"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="phone-pad"
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    minHeight: 44,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: colors.success,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  bottomPadding: {
    height: 100,
  },
});
