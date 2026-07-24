import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { IntegrationStatus, SyncHistoryEntry } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type ScenarioType = 'SUCCESS' | 'ERP_ERROR' | 'POS_ERROR';

export const IntegrationStatusScreen: React.FC = () => {
  const { erpStatus, posStatus, lastSync, syncHistory, triggerSync, navigate, userRole } = useApp();
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('SUCCESS');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    
    // Determine scenario type to pass to triggerSync
    const scenarioParam =
      selectedScenario === 'SUCCESS' ? 'success' :
      selectedScenario === 'ERP_ERROR' ? 'erp_error' : 'pos_error';

    try {
      await triggerSync(scenarioParam);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
      
      if (selectedScenario === 'SUCCESS') {
        Alert.alert('Thành công 🎉', 'Dữ liệu sản phẩm ERP và lịch sử hóa đơn POS đã được đồng bộ hóa hoàn tất!');
      } else {
        Alert.alert('Đồng bộ thất bại ⚠️', `Gặp lỗi kết nối trong quá trình truyền tải dữ liệu hệ thống ${selectedScenario === 'ERP_ERROR' ? 'ERP' : 'POS'}. Một thông báo khẩn cấp đã được gửi tới Quản lý!`);
      }
    }
  };

  const getStatusBadgeStyles = (status: IntegrationStatus) => {
    switch (status) {
      case 'Connected':
        return { bg: COLORS.LIGHT_GREEN, color: COLORS.DARK_GREEN, text: 'ĐÃ KẾT NỐI' };
      case 'Syncing':
        return { bg: '#E2F3FF', color: '#0066FF', text: 'ĐỒNG BỘ...' };
      case 'Error':
      case 'Disconnected':
      default:
        return { bg: '#FFF0F2', color: COLORS.RED, text: 'MẤT KẾT NỐI' };
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            // Return to previous dashboard depending on who accessed it
            if (userRole === 'manager') {
              navigate('manager_dashboard');
            } else {
              navigate('staff_dashboard');
            }
          }}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Đồng bộ ERP / POS</Text>
        <View style={{ width: 35 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Tích hợp hệ thống cốt lõi (ERP/POS)</Text>
          <Text style={styles.introSub}>
            Đồng bộ hóa danh mục giá/kho từ ERP trung tâm và truyền tải dữ liệu hóa đơn giao dịch về máy POS quầy thu ngân.
          </Text>
        </View>

        {/* Systems connection panel */}
        <Text style={styles.sectionHeaderTitle}>Trạng thái kết nối hiện tại</Text>
        <View style={styles.systemsGrid}>
          {/* ERP System */}
          <View style={[styles.systemCard, erpStatus === 'Error' && styles.systemCardError]}>
            <View style={styles.systemCardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: '#E2F3FF' }]}>
                <Ionicons name="cloud-done-outline" size={20} color="#0066FF" />
              </View>
              <Text style={styles.systemName}>ERP Core System</Text>
            </View>

            <View style={styles.metaBox}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Trạng thái:</Text>
                <View style={[styles.badge, { backgroundColor: getStatusBadgeStyles(erpStatus).bg }]}>
                  <Text style={[styles.badgeText, { color: getStatusBadgeStyles(erpStatus).color }]}>
                    {getStatusBadgeStyles(erpStatus).text}
                  </Text>
                </View>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Đồng bộ cuối:</Text>
                <Text style={styles.metaVal}>{lastSync}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Bản ghi đã nhận:</Text>
                <Text style={styles.metaVal}>{erpStatus === 'Error' ? 'Lỗi (Error 504)' : '15 sản phẩm'}</Text>
              </View>
            </View>
          </View>

          {/* POS System */}
          <View style={[styles.systemCard, posStatus === 'Error' && styles.systemCardError]}>
            <View style={styles.systemCardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: '#FAFCFA' }]}>
                <Ionicons name="card-outline" size={20} color={COLORS.GREEN} />
              </View>
              <Text style={styles.systemName}>POS Cashier quầy</Text>
            </View>

            <View style={styles.metaBox}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Trạng thái:</Text>
                <View style={[styles.badge, { backgroundColor: getStatusBadgeStyles(posStatus).bg }]}>
                  <Text style={[styles.badgeText, { color: getStatusBadgeStyles(posStatus).color }]}>
                    {getStatusBadgeStyles(posStatus).text}
                  </Text>
                </View>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Đồng bộ cuối:</Text>
                <Text style={styles.metaVal}>{lastSync}</Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Hóa đơn gửi đi:</Text>
                <Text style={styles.metaVal}>{posStatus === 'Error' ? 'Lỗi (Error 409)' : 'Đã khớp'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DEMO SCENARIO SELECTOR */}
        <View style={styles.demoControlCard}>
          <View style={styles.demoTitleRow}>
            <Ionicons name="options-outline" size={16} color="#E8590C" />
            <Text style={styles.demoControlTitle}>CẤU HÌNH KỊCH BẢN ĐỒNG BỘ (DEMO MODE)</Text>
          </View>
          <Text style={styles.demoControlSub}>Chọn kết quả giả lập trước khi bấm đồng bộ để biểu diễn kịch bản thuyết trình:</Text>

          <View style={styles.scenarioGrid}>
            <Pressable
              style={[styles.scenarioBtn, selectedScenario === 'SUCCESS' && styles.scenarioBtnActive]}
              onPress={() => setSelectedScenario('SUCCESS')}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={selectedScenario === 'SUCCESS' ? COLORS.DARK_GREEN : COLORS.MUTED} />
              <Text style={[styles.scenarioBtnText, selectedScenario === 'SUCCESS' && styles.scenarioBtnTextActive]}>
                Thành công
              </Text>
            </Pressable>

            <Pressable
              style={[styles.scenarioBtn, selectedScenario === 'ERP_ERROR' && styles.scenarioBtnActiveError]}
              onPress={() => setSelectedScenario('ERP_ERROR')}
            >
              <Ionicons name="close-circle-outline" size={16} color={selectedScenario === 'ERP_ERROR' ? COLORS.RED : COLORS.MUTED} />
              <Text style={[styles.scenarioBtnText, selectedScenario === 'ERP_ERROR' && styles.scenarioBtnTextActiveError]}>
                Lỗi ERP (504)
              </Text>
            </Pressable>

            <Pressable
              style={[styles.scenarioBtn, selectedScenario === 'POS_ERROR' && styles.scenarioBtnActiveError]}
              onPress={() => setSelectedScenario('POS_ERROR')}
            >
              <Ionicons name="close-circle-outline" size={16} color={selectedScenario === 'POS_ERROR' ? COLORS.RED : COLORS.MUTED} />
              <Text style={[styles.scenarioBtnText, selectedScenario === 'POS_ERROR' && styles.scenarioBtnTextActiveError]}>
                Lỗi POS (409)
              </Text>
            </Pressable>
          </View>

          {/* Sync Button */}
          <Pressable style={[styles.syncNowBtn, isSyncing && styles.syncNowBtnDisabled]} onPress={handleSyncNow} disabled={isSyncing}>
            {isSyncing ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.syncNowText}>Đang đồng bộ hóa dữ liệu...</Text>
              </>
            ) : (
              <>
                <Ionicons name="sync-outline" size={18} color="#FFFFFF" />
                <Text style={styles.syncNowText}>Kích hoạt đồng bộ ngay (Sync Now)</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* SYNC HISTORY LIST */}
        <Text style={styles.sectionHeaderTitle}>Lịch sử đồng bộ hệ thống ({syncHistory.length} phiên)</Text>
        {syncHistory.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Chưa có lịch sử đồng bộ nào ghi nhận.</Text>
          </View>
        ) : (
          syncHistory.map((history) => {
            const isSuccess = history.status === 'success';
            return (
              <View key={history.id} style={[styles.historyCard, !isSuccess && styles.historyCardError]}>
                <View style={styles.historyHeader}>
                  <View style={styles.historySystemRow}>
                    <Ionicons
                      name={history.system === 'ERP' ? 'cloud-outline' : 'card-outline'}
                      size={14}
                      color={isSuccess ? COLORS.DARK_GREEN : COLORS.RED}
                    />
                    <Text style={styles.historySystemName}>Đồng bộ hệ thống {history.system}</Text>
                  </View>
                  <Text style={styles.historyId}>{history.id}</Text>
                </View>

                <View style={styles.historyMeta}>
                  <Text style={styles.historyMetaLabel}>Thời gian: <Text style={styles.historyMetaVal}>{history.startTime}</Text></Text>
                  <Text style={styles.historyMetaLabel}>Kết quả: <Text style={[styles.historyMetaVal, { color: isSuccess ? COLORS.GREEN : COLORS.RED, fontWeight: '900' }]}>{isSuccess ? 'THÀNH CÔNG' : 'THẤT BẠI'}</Text></Text>
                </View>

                <View style={styles.historyMeta}>
                  <Text style={styles.historyMetaLabel}>Số bản ghi: <Text style={styles.historyMetaVal}>{history.recordsProcessed} record</Text></Text>
                  {history.errorMessage && (
                    <Text style={styles.historyMetaLabel}>Lỗi: <Text style={[styles.historyMetaVal, { color: COLORS.RED }]}>{history.errorMessage}</Text></Text>
                  )}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    padding: 16,
    marginBottom: 14,
    ...SHADOW,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  introSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.MUTED,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 6,
  },
  systemsGrid: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },
  systemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    padding: 14,
    ...SHADOW,
  },
  systemCardError: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFF8F8',
  },
  systemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 8,
    marginBottom: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemName: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  metaBox: {
    gap: 6,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  metaVal: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '800',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
  },

  /* Demo control */
  demoControlCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFE8CC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...SHADOW,
  },
  demoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  demoControlTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#E8590C',
    letterSpacing: 0.5,
  },
  demoControlSub: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    lineHeight: 14,
    marginBottom: 12,
  },
  scenarioGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  scenarioBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  scenarioBtnActive: {
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  scenarioBtnActiveError: {
    borderColor: COLORS.RED,
    backgroundColor: '#FFF0F2',
  },
  scenarioBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  scenarioBtnTextActive: {
    color: COLORS.DARK_GREEN,
  },
  scenarioBtnTextActiveError: {
    color: COLORS.RED,
  },
  syncNowBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.GREEN,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },
  syncNowBtnDisabled: {
    backgroundColor: '#D2DDD4',
    elevation: 0,
    shadowOpacity: 0,
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  /* Sync history */
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  emptyText: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: COLORS.BORDER,
    padding: 12,
    marginBottom: 10,
    ...SHADOW,
  },
  historyCardError: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFFBFB',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 6,
    marginBottom: 8,
  },
  historySystemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historySystemName: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  historyId: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.MUTED,
  },
  historyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  historyMetaLabel: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  historyMetaVal: {
    color: COLORS.TEXT,
    fontWeight: '800',
  },
});
