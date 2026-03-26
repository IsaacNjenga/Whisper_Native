import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "react-native-paper";

export default function Settings() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Page title */}
        <Text style={styles.pageTitle}>Settings</Text>

        {/* ── Profile card ── */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          {user?.avatar === <Text>null</Text> ? (
            <Avatar.Image size={24} source={user?.avatar} />
          ) : (
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase() ?? "?"}
              </Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.username ?? "—"}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? "—"}</Text>
            <Text style={styles.profileEditHint}>Tap to edit profile →</Text>
          </View>
        </TouchableOpacity>

        {/* ── Account ── */}
        <SectionLabel title="Account" />
        <View style={styles.group}>
          <RowLink label="Edit profile" icon="👤" onPress={() => {}} />
          <Divider />
          <RowLink label="Change password" icon="🔑" onPress={() => {}} />
          <Divider />
          <RowLink label="Linked accounts" icon="🔗" onPress={() => {}} />
        </View>

        {/* ── Notifications ── */}
        <SectionLabel title="Notifications" />
        <View style={styles.group}>
          <RowToggle
            label="Push notifications"
            icon="🔔"
            value={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
          <Divider />
          <RowToggle
            label="Email updates"
            icon="📧"
            value={emailUpdates}
            onToggle={() => setEmailUpdates(!emailUpdates)}
          />
        </View>

        {/* ── Appearance ── */}
        <SectionLabel title="Appearance" />
        <View style={styles.group}>
          <RowToggle
            label="Dark mode"
            icon="🌙"
            value={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
        </View>

        {/* ── Support ── */}
        <SectionLabel title="Help & support" />
        <View style={styles.group}>
          <RowLink label="Help center" icon="❓" onPress={() => {}} />
          <Divider />
          <RowLink label="Send feedback" icon="💬" onPress={() => {}} />
          <Divider />
          <RowLink label="Privacy policy" icon="🛡️" onPress={() => {}} />
          <Divider />
          <RowLink label="Terms of service" icon="📄" onPress={() => {}} />
        </View>

        {/* ── Danger zone ── */}
        <SectionLabel title="Danger zone" />
        <View style={styles.group}>
          <RowLink label="Delete account" icon="🗑️" onPress={() => {}} danger />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Reusable sub-components ──

function SectionLabel({ title }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

function RowLink({ label, icon, onPress, danger = false }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.chevron, danger && styles.chevronDanger]}>›</Text>
    </TouchableOpacity>
  );
}

function RowToggle({ label, icon, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#e5e7eb", true: "#c4b5fd" }}
        thumbColor={value ? "#6C47FF" : "#ffffff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // Title
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a2e",
    marginBottom: 20,
  },

  // Profile card
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#6C47FF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#ffffff",
  },
  profileEmail: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
  },
  profileEditHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.9,
    marginBottom: 8,
    marginTop: 20,
    marginLeft: 4,
  },

  // Group card
  group: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  rowIcon: {
    fontSize: 18,
    width: 28,
    textAlign: "center",
  },
  rowLabel: {
    fontSize: 15,
    color: "#1a1a2e",
    fontWeight: "400",
  },
  rowLabelDanger: {
    color: "#dc2626",
  },
  chevron: {
    fontSize: 22,
    color: "#d1d5db",
    lineHeight: 26,
  },
  chevronDanger: {
    color: "#fca5a5",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginLeft: 40,
  },

  // Logout
  logoutButton: {
    backgroundColor: "#fef2f2",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 28,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutText: {
    color: "#dc2626",
    fontSize: 15,
    fontWeight: "600",
  },

  // Version
  version: {
    textAlign: "center",
    fontSize: 12,
    color: "#d1d5db",
    marginTop: 20,
  },
});
