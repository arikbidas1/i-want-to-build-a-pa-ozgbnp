
import React, { useState } from "react";
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Linking, Platform } from "react-native";
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

const CHECKLIST_DATA: ChecklistSection[] = [
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

export default function FlightChecklistScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<ChecklistSection[]>(CHECKLIST_DATA);

  const toggleItem = (sectionId: string, itemId: string) => {
    console.log("User toggled checklist item:", itemId);
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : section
      )
    );
  };

  const handleCallPress = (phoneNumber: string) => {
    console.log("User tapped Call CA button, phone:", phoneNumber);
    const phoneUrl = `tel:${phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          console.log("Opening phone dialer for:", phoneNumber);
          return Linking.openURL(phoneUrl);
        } else {
          console.log("Phone dialer not supported on this device");
        }
      })
      .catch((err) => console.error("Error opening phone dialer:", err));
  };

  const handleReset = () => {
    console.log("User tapped Reset button");
    setSections(CHECKLIST_DATA.map(section => ({
      ...section,
      items: section.items.map(item => ({ ...item, checked: false }))
    })));
  };

  const handleEditPress = () => {
    console.log("User tapped Edit button, navigating to edit screen");
    router.push("/edit-checklist");
  };

  const getSectionProgress = (section: ChecklistSection) => {
    const checkedCount = section.items.filter((item) => item.checked).length;
    const totalCount = section.items.length;
    return { checkedCount, totalCount };
  };

  const getTotalProgress = () => {
    const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);
    const checkedCount = sections.reduce((sum, section) => 
      sum + section.items.filter(item => item.checked).length, 0
    );
    return { checkedCount, totalItems };
  };

  const getSortedItems = (section: ChecklistSection) => {
    const unchecked = section.items.filter((item) => !item.checked);
    const checked = section.items.filter((item) => item.checked);
    return [...unchecked, ...checked];
  };

  const totalProgress = getTotalProgress();
  const progressPercentage = totalProgress.totalItems > 0 
    ? Math.round((totalProgress.checkedCount / totalProgress.totalItems) * 100) 
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <IconSymbol
            ios_icon_name="airplane"
            android_material_icon_name="flight"
            size={32}
            color={colors.primary}
          />
          <Text style={styles.headerTitle}>Part 135 Flight Checklist</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPress}
            activeOpacity={0.7}
          >
            <IconSymbol
              ios_icon_name="pencil"
              android_material_icon_name="edit"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{totalProgress.checkedCount}</Text>
            <Text style={styles.progressTextSeparator}>/</Text>
            <Text style={styles.progressText}>{totalProgress.totalItems}</Text>
            <Text style={styles.progressLabel}>completed</Text>
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
          activeOpacity={0.7}
        >
          <IconSymbol
            ios_icon_name="arrow.counterclockwise"
            android_material_icon_name="refresh"
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.resetButtonText}>Reset All</Text>
        </TouchableOpacity>
      </View>

      {/* Checklist Sections */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => {
          const sectionProgress = getSectionProgress(section);
          const sortedItems = getSortedItems(section);

          return (
            <View key={section.id} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.sectionProgressContainer}>
                  <Text style={styles.sectionProgressText}>{sectionProgress.checkedCount}</Text>
                  <Text style={styles.sectionProgressSeparator}>/</Text>
                  <Text style={styles.sectionProgressText}>{sectionProgress.totalCount}</Text>
                </View>
              </View>

              {sortedItems.map((item) => {
                const isChecked = item.checked;

                return (
                  <View key={item.id} style={styles.itemContainer}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => toggleItem(section.id, item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                        {isChecked && (
                          <IconSymbol
                            ios_icon_name="checkmark"
                            android_material_icon_name="check"
                            size={18}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                      <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                        {item.text}
                      </Text>
                    </TouchableOpacity>

                    {item.requiresCall && item.phoneNumber && (
                      <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => handleCallPress(item.phoneNumber!)}
                        activeOpacity={0.7}
                      >
                        <IconSymbol
                          ios_icon_name="phone.fill"
                          android_material_icon_name="phone"
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

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
    backgroundColor: colors.backgroundAlt,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.highlight,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 4,
  },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  progressTextSeparator: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginHorizontal: 4,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    flex: 1,
  },
  sectionProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.highlight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  sectionProgressSeparator: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    marginHorizontal: 2,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  itemText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  itemTextChecked: {
    color: colors.textSecondary,
    textDecorationLine: "line-through",
  },
  callButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  bottomPadding: {
    height: 100,
  },
});
