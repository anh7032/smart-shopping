import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOW } from './Theme';

// 1. LoadingState Component
interface LoadingStateProps {
  message?: string;
}
export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={COLORS.GREEN} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
};

// 2. ErrorState Component
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
  btnText?: string;
}
export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry, btnText = 'Thử lại' }) => {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name="alert-circle-outline" size={48} color={COLORS.RED} />
      <Text style={styles.errorText}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Ionicons name="sync-outline" size={14} color="#FFFFFF" />
          <Text style={styles.retryBtnText}>{btnText}</Text>
        </Pressable>
      )}
    </View>
  );
};

// 3. EmptyState Component
interface EmptyStateProps {
  message: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}
export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon = 'file-tray-outline' }) => {
  return (
    <View style={styles.centerContainer}>
      <Ionicons name={icon} size={44} color={COLORS.MUTED} />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
};

// 4. StatusBadge Component
interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'failed' | 'warning' | 'info' | string;
  label: string;
}
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  let bg = '#ECECEC';
  let color = '#636363';

  const s = status.toLowerCase();
  if (s === 'active' || s === 'success' || s === 'checked' || s === 'resolved') {
    bg = COLORS.LIGHT_GREEN;
    color = COLORS.DARK_GREEN;
  } else if (s === 'failed' || s === 'error' || s === 'discrepancy' || s === 'critical') {
    bg = '#FFF0F2';
    color = COLORS.RED;
  } else if (s === 'pending' || s === 'warning' || s === 'low_stock') {
    bg = '#FFF9DB';
    color = '#E8590C';
  } else if (s === 'info' || s === 'syncing' || s === 'scheduled') {
    bg = '#E2F3FF';
    color = '#0066FF';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
};

// 5. ConfirmationDialog Component
interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}
export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy',
  isDestructive = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.dialogOverlay}>
        <View style={styles.dialogCard}>
          <Text style={styles.dialogTitle}>{title}</Text>
          <Text style={styles.dialogMessage}>{message}</Text>
          <View style={styles.dialogButtons}>
            <Pressable style={styles.dialogCancelBtn} onPress={onCancel}>
              <Text style={styles.dialogCancelText}>{cancelText}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.dialogConfirmBtn,
                { backgroundColor: isDestructive ? COLORS.RED : COLORS.GREEN },
              ]}
              onPress={onConfirm}
            >
              <Text style={styles.dialogConfirmText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.RED,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    marginTop: 6,
    ...SHADOW,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '900',
  },

  /* Dialog styles */
  dialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 320,
    gap: 12,
    ...SHADOW,
  },
  dialogTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.TEXT,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dialogCancelBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogCancelText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '800',
  },
  dialogConfirmBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogConfirmText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
