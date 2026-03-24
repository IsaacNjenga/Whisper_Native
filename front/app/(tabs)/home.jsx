import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.username?.split(" ")[0] ?? "there"} 👋
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>

          {/* Avatar / logout */}
          <TouchableOpacity style={styles.avatar} onPress={handleLogout}>
            <Text style={styles.avatarText}>
              {user?.username?.charAt(0).toUpperCase() ?? "?"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Welcome card */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>You&apos;re all set! 🎉</Text>
          <Text style={styles.welcomeBody}>
            You&apos;ve successfully logged in. Start building out your home
            screen content here.
          </Text>
        </View>

        {/* Quick action cards */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.cardGrid}>
          <QuickCard
            icon="📊"
            label="Dashboard"
            color="#ede9fe"
            onPress={() => {}}
          />
          <QuickCard
            icon="👤"
            label="Profile"
            color="#e0f2fe"
            onPress={() => {}}
          />
          <QuickCard
            icon="⚙️"
            label="Settings"
            color="#fef9c3"
            onPress={() => {}}
          />
          <QuickCard
            icon="🚪"
            label="Logout"
            color="#fee2e2"
            onPress={handleLogout}
          />
        </View>

        {/* User info card */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoCard}>
          <InfoRow label="Name" value={user?.username ?? "—"} />
          <View style={styles.divider} />
          <InfoRow label="Email" value={user?.email ?? "—"} />
          <View style={styles.divider} />
          <InfoRow label="Role" value={user?.role ?? "User"} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickCard({ icon, label, color, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.quickIcon}>{icon}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 16,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a2e",
  },
  date: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#6C47FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  // Welcome card
  welcomeCard: {
    backgroundColor: "#6C47FF",
    borderRadius: 20,
    padding: 24,
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  welcomeBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 22,
  },

  // Quick actions
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a2e",
    marginBottom: -4,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickCard: {
    width: "47%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  quickIcon: {
    fontSize: 28,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a2e",
  },

  // Info card
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a2e",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
  },
});
