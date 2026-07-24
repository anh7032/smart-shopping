import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { AuditLog, UserRole } from '../types';
import { COLORS, SHADOW, TOP_INSET } from '../components/Theme';

type RoleFilter = 'ALL' | 'STORE_STAFF' | 'MANAGER' | 'EXIT_STAFF';

export const AuditLogScreen: React.FC = () => {
  const { auditLogs, navigate } = useApp();
  const [activeRole, setActiveRole] = useState<RoleFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logs dynamically
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // 1. Search Query Match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        log.description.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Role Filter Match
      if (activeRole === 'ALL') return true;
      if (activeRole === 'STORE_STAFF') return log.userRole === 'store_staff';
      if (activeRole === 'MANAGER') return log.userRole === 'manager';
      if (activeRole === 'EXIT_STAFF') return log.userRole === 'exit_staff' || log.userRole === 'inspector';
      return true;
    });
  }, [auditLogs, activeRole, searchQuery]);

  const getRoleIcon = (role: UserRole): React.ComponentProps<typeof Ionicons>['name'] => {
    switch (role) {
      case 'manager':
        return 'key-outline';
      case 'store_staff':
        return 'briefcase-outline';
      case 'inspector':
      case 'exit_staff':
        return 'shield-checkmark-outline';
      case 'customer':
      case 'vip':
      default:
        return 'person-outline';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'manager':
        return '#E81B60'; // Red/Pink
      case 'store_staff':
        return '#FF922B'; // Orange
      case 'inspector':
      case 'exit_staff':
        return '#0066FF'; // Blue
      default:
        return COLORS.MUTED;
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('manager_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Nhật ký vận hành</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={COLORS.MUTED} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm mô tả, hành động, ID log..."
            placeholderTextColor="#A1AEA5"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color={COLORS.MUTED} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabSection}>
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'STORE_STAFF', label: 'Nhân viên' },
          { key: 'EXIT_STAFF', label: 'Kiểm soát' },
          { key: 'MANAGER', label: 'Quản lý' },
        ] as { key: RoleFilter; label: string }[]).map((tab) => {
          const isActive = activeRole === tab.key;
          return (
            <Pressable key={tab.key} style={[styles.tabBtn, isActive && styles.tabBtnActive]} onPress={() => setActiveRole(tab.key)}>
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Logs Scroll List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.resultsCount}>Đang hiển thị {filteredLogs.length} sự kiện kiểm toán</Text>

        {filteredLogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={48} color={COLORS.MUTED} />
            <Text style={styles.emptyText}>Nhật ký trống!</Text>
            <Text style={styles.emptySub}>Chưa có hành động nào được ghi nhận khớp với bộ lọc.</Text>
          </View>
        ) : (
          filteredLogs.map((log) => {
            const roleColor = getRoleColor(log.userRole);
            return (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.roleLabel}>
                    <Ionicons name={getRoleIcon(log.userRole)} size={14} color={roleColor} />
                    <Text style={[styles.roleLabelText, { color: roleColor }]}>{log.userRole.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.logId}>{log.id}</Text>
                </View>

                <View style={styles.actionBlock}>
                  <Text style={styles.actionText}>HÀNH ĐỘNG: <Text style={styles.actionValText}>{log.action}</Text></Text>
                  <Text style={styles.targetText}>ĐỐI TƯỢNG: <Text style={styles.targetValText}>{log.target}</Text></Text>
                </View>

                <Text style={styles.logDesc}>{log.description}</Text>
                
                <View style={styles.divider} />
                <View style={styles.timeRow}>
                  <Ionicons name="time-outline" size={12} color={COLORS.MUTED} />
                  <Text style={styles.timeText}>{log.timestamp}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: TOP_INSET + 10,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    ...SHADOW,
    zIndex: 10,
  },
  backButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  searchSection: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    backgroundColor: '#FAFCFA',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
    height: '100%',
  },
  tabSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  tabTextActive: {
    color: COLORS.DARK_GREEN,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  resultsCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  emptySub: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: 'center',
  },

  /* Log Cards */
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 6,
    marginBottom: 8,
  },
  roleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  logId: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  actionBlock: {
    gap: 2,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  actionValText: {
    color: COLORS.TEXT,
    fontWeight: '900',
  },
  targetText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  targetValText: {
    color: COLORS.DARK_GREEN,
    fontWeight: '900',
  },
  logDesc: {
    fontSize: 11.5,
    color: COLORS.TEXT,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 9,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
});
