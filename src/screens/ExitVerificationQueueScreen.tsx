import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { Receipt } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

type QueueFilter = 'ALL' | 'WAITING' | 'MISMATCH' | 'RESOLVED';

export const ExitVerificationQueueScreen: React.FC = () => {
  const { receipts, updateReceipt, navigate, logAuditAction } = useApp();
  const [activeFilter, setActiveFilter] = useState<QueueFilter>('ALL');

  // Modals state for handling resolution
  const [selectedReceipt, setSelectedProduct] = useState<Receipt | null>(null);
  const [isResolveModalVisible, setIsResolveModalVisible] = useState(false);
  const [note, setNote] = useState('');

  // Filter receipt sessions
  const filteredSessions = useMemo(() => {
    return receipts.filter((r) => {
      switch (activeFilter) {
        case 'WAITING':
          return r.status === 'paid';
        case 'MISMATCH':
          return r.status === 'discrepancy';
        case 'RESOLVED':
          return r.status === 'resolved' || r.status === 'checked';
        case 'ALL':
        default:
          return true;
      }
    });
  }, [receipts, activeFilter]);

  const handleOpenResolve = (receipt: Receipt) => {
    if (receipt.status === 'resolved' || receipt.status === 'checked') {
      Alert.alert('Đã xử lý', 'Phiên kiểm soát này đã hoàn thành, không thể xử lý lại.');
      return;
    }
    setSelectedProduct(receipt);
    setNote('');
    setIsResolveModalVisible(true);
  };

  const handleResolveAction = async (actionType: 'PAY_DIFF' | 'REMOVE_ITEM' | 'MANUAL' | 'CANCEL') => {
    if (!selectedReceipt) return;

    if (note.trim() === '') {
      Alert.alert('Ghi chú trống', 'Vui lòng nhập ghi chú xử lý để lưu lại nhật ký bắt buộc.');
      return;
    }

    let nextStatus: Receipt['status'] = 'resolved';
    let description = '';

    switch (actionType) {
      case 'PAY_DIFF':
        nextStatus = 'resolved';
        description = `Đã xử lý thu tiền chênh lệch. Ghi chú: ${note}`;
        break;
      case 'REMOVE_ITEM':
        nextStatus = 'resolved';
        description = `Đã loại bỏ các mặt hàng thừa trả lại kho. Ghi chú: ${note}`;
        break;
      case 'MANUAL':
        nextStatus = 'resolved';
        description = `Đã xác nhận giải quyết thủ công bởi nhân viên. Ghi chú: ${note}`;
        break;
      case 'CANCEL':
        nextStatus = 'cancelled';
        description = `Đã hủy phiên giao dịch. Ghi chú: ${note}`;
        break;
    }

    // Update receipt
    const updatedReceipt: Receipt = {
      ...selectedReceipt,
      status: nextStatus,
      resolutionNote: note.trim(),
    };

    await updateReceipt(updatedReceipt);

    // Write audit log
    await logAuditAction(
      actionType === 'CANCEL' ? 'SESSION_CANCELLED' : 'DISCREPANCY_RESOLVED',
      selectedReceipt.id,
      `[Mã hóa đơn: ${selectedReceipt.id}] ${description}`
    );

    Alert.alert(
      'Thành công 🎉',
      actionType === 'CANCEL' ? 'Đã hủy phiên mua sắm thành công!' : 'Đã giải quyết chênh lệch và hoàn tất kiểm tra thành công!'
    );
    setIsResolveModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('staff_dashboard')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <Text style={styles.headerTitle}>Hàng đợi soát vé</Text>
        <View style={{ width: 35 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabSection}>
        {([
          { key: 'ALL', label: 'Tất cả' },
          { key: 'WAITING', label: 'Chờ kiểm soát' },
          { key: 'MISMATCH', label: 'Lệch hóa đơn' },
          { key: 'RESOLVED', label: 'Đã xử lý' },
        ] as { key: QueueFilter; label: string }[]).map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveFilter(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* List Queue */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>Đang có {filteredSessions.length} phiên soát vé</Text>

        {filteredSessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color={COLORS.GREEN} />
            <Text style={styles.emptyTitle}>Hàng đợi trống!</Text>
            <Text style={styles.emptySub}>Không có phiên thanh toán nào đang chờ giải quyết hoặc bị lệch.</Text>
          </View>
        ) : (
          filteredSessions.map((session) => {
            const isMismatch = session.status === 'discrepancy';
            const isWaiting = session.status === 'paid';
            const isResolved = session.status === 'resolved' || session.status === 'checked';
            const isCancelled = session.status === 'cancelled';

            return (
              <Pressable
                key={session.id}
                style={[
                  styles.sessionCard,
                  isMismatch && styles.sessionCardMismatch,
                  isWaiting && styles.sessionCardWaiting,
                  isResolved && styles.sessionCardResolved,
                ]}
                onPress={() => handleOpenResolve(session)}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.receiptId}>{session.id}</Text>
                    <Text style={styles.sessionTime}>Thời gian: {session.createdAt}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    isMismatch && styles.badgeMismatch,
                    isWaiting && styles.badgeWaiting,
                    isResolved && styles.badgeResolved,
                    isCancelled && styles.badgeCancelled,
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      isMismatch && styles.badgeTextMismatch,
                      isWaiting && styles.badgeTextWaiting,
                      isResolved && styles.badgeTextResolved,
                      isCancelled && styles.badgeTextCancelled,
                    ]}>
                      {isMismatch ? 'LỆCH GIỎ' : isWaiting ? 'ĐANG CHỜ' : isCancelled ? 'ĐÃ HỦY' : 'ĐÃ KHỚP'}
                    </Text>
                  </View>
                </View>

                {/* Session Body Details */}
                <View style={styles.cardBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Khách hàng:</Text>
                    <Text style={styles.detailValue}>{session.customerName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mã xe đẩy:</Text>
                    <Text style={styles.detailValue}>{session.cartCode}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Số sản phẩm:</Text>
                    <Text style={styles.detailValue}>{session.totalQuantity} SP</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hóa đơn thanh toán:</Text>
                    <Text style={styles.detailPrice}>{money(session.totalPrice)}</Text>
                  </View>

                  {session.resolutionNote && (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteTitle}>Ghi chú xử lý:</Text>
                      <Text style={styles.noteText}>{session.resolutionNote}</Text>
                    </View>
                  )}
                </View>

                {/* Footer action trigger only if mismatch */}
                {!isResolved && !isCancelled && (
                  <View style={styles.cardFooter}>
                    <Text style={styles.footerActionText}>
                      {isMismatch ? '👉 Nhấn để xử lý lệch hóa đơn ngay' : '👉 Chờ khách hàng quét QR xác thực tại lối ra'}
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color={isMismatch ? COLORS.RED : COLORS.MUTED} />
                  </View>
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {/* RESOLUTION OPTIONS MODAL */}
      <Modal visible={isResolveModalVisible} transparent animationType="slide" onRequestClose={() => setIsResolveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedReceipt && (
              <>
                <Text style={styles.modalHeaderTitle}>Xử lý lệch hóa đơn của khách</Text>
                <Text style={styles.modalHeaderSub}>{selectedReceipt.customerName} • Mã xe: {selectedReceipt.cartCode}</Text>

                {/* Discrepancy details summary */}
                <View style={styles.discrepancyBox}>
                  <Text style={styles.discrepancyTitle}>Chi tiết các mặt hàng chưa quét thanh toán:</Text>
                  {selectedReceipt.discrepancyItems && selectedReceipt.discrepancyItems.length > 0 ? (
                    selectedReceipt.discrepancyItems.map((item, index) => (
                      <Text key={index} style={styles.discrepancyItemText}>
                        - {item.name} x {item.quantity} (Tổng {money(item.price * item.quantity)})
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.discrepancyItemText}>- Chênh lệch trọng lượng giỏ hàng phát hiện bởi cảm biến cân nặng.</Text>
                  )}
                  {selectedReceipt.additionalPaymentNeeded && (
                    <Text style={styles.totalDiffText}>Số tiền cần đóng thêm: {money(selectedReceipt.additionalPaymentNeeded)}</Text>
                  )}
                </View>

                {/* Resolution note input */}
                <Text style={styles.inputLabel}>Nhập lý do & cách xử lý thực tế *</Text>
                <TextInput
                  style={styles.noteInput}
                  placeholder="Ví dụ: Khách đóng thêm tiền mặt / Trả lại sản phẩm rau cải vào kệ..."
                  placeholderTextColor="#A1AEA5"
                  value={note}
                  onChangeText={setNote}
                  multiline
                />

                {/* Resolution Actions Grid */}
                <Text style={[styles.inputLabel, { marginTop: 8 }]}>Chọn phương án giải quyết:</Text>
                <View style={styles.actionBtnGrid}>
                  <Pressable style={[styles.actionBtn, { borderColor: COLORS.GREEN }]} onPress={() => handleResolveAction('PAY_DIFF')}>
                    <Ionicons name="card-outline" size={16} color={COLORS.GREEN} />
                    <Text style={[styles.actionBtnText, { color: COLORS.GREEN }]}>Khách nộp thêm tiền (Pay Diff)</Text>
                  </Pressable>

                  <Pressable style={[styles.actionBtn, { borderColor: '#FF922B' }]} onPress={() => handleResolveAction('REMOVE_ITEM')}>
                    <Ionicons name="arrow-back-outline" size={16} color="#FF922B" />
                    <Text style={[styles.actionBtnText, { color: '#FF922B' }]}>Gỡ hàng trả lại kho (Remove)</Text>
                  </Pressable>

                  <Pressable style={[styles.actionBtn, { borderColor: '#0066FF' }]} onPress={() => handleResolveAction('MANUAL')}>
                    <Ionicons name="checkmark-circle-outline" size={16} color="#0066FF" />
                    <Text style={[styles.actionBtnText, { color: '#0066FF' }]}>Xác nhận giải quyết thủ công</Text>
                  </Pressable>

                  <Pressable style={[styles.actionBtn, { borderColor: COLORS.RED }]} onPress={() => handleResolveAction('CANCEL')}>
                    <Ionicons name="close-circle-outline" size={16} color={COLORS.RED} />
                    <Text style={[styles.actionBtnText, { color: COLORS.RED }]}>Hủy bỏ phiên giao dịch này</Text>
                  </Pressable>
                </View>

                <Pressable style={styles.modalCloseBtn} onPress={() => setIsResolveModalVisible(false)}>
                  <Text style={styles.modalCloseText}>Đóng</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
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
    height: 34,
    borderRadius: 10,
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
    fontWeight: '700',
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
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    padding: 14,
    marginBottom: 12,
    ...SHADOW,
  },
  sessionCardMismatch: {
    borderColor: '#FFA8A8',
    backgroundColor: '#FFF8F8',
  },
  sessionCardWaiting: {
    borderColor: '#D0E1FD',
    backgroundColor: '#F7FAFF',
  },
  sessionCardResolved: {
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    opacity: 0.85,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    paddingBottom: 10,
  },
  receiptId: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  sessionTime: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeMismatch: {
    backgroundColor: '#FF3E52',
  },
  badgeWaiting: {
    backgroundColor: '#0066FF',
  },
  badgeResolved: {
    backgroundColor: COLORS.GREEN,
  },
  badgeCancelled: {
    backgroundColor: COLORS.MUTED,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  badgeTextMismatch: {
    color: '#FFFFFF',
  },
  badgeTextWaiting: {
    color: '#FFFFFF',
  },
  badgeTextResolved: {
    color: '#FFFFFF',
  },
  badgeTextCancelled: {
    color: '#FFFFFF',
  },
  cardBody: {
    paddingVertical: 10,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  detailValue: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '700',
  },
  detailPrice: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  noteBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#EDF2EE',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  noteTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
  },
  noteText: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 8,
    marginTop: 6,
  },
  footerActionText: {
    fontSize: 10,
    color: COLORS.MUTED,
    fontWeight: '800',
  },

  /* Resolution Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  modalHeaderSub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  discrepancyBox: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFA8A8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  discrepancyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.RED,
    marginBottom: 6,
  },
  discrepancyItemText: {
    fontSize: 11,
    color: COLORS.TEXT,
    fontWeight: '600',
    lineHeight: 16,
  },
  totalDiffText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.RED,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFE0E0',
    paddingTop: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  noteInput: {
    height: 60,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.TEXT,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  actionBtnGrid: {
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
  },
  modalCloseBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDF2EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalCloseText: {
    fontSize: 13,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
});
