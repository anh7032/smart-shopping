import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useApp } from './src/context/AppContext';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SessionInitScreen } from './src/screens/SessionInitScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ShelfMapScreen } from './src/screens/ShelfMapScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { AISuggestionScreen } from './src/screens/AISuggestionScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { QRPaymentScreen } from './src/screens/QRPaymentScreen';
import { InvoiceScreen } from './src/screens/InvoiceScreen';
import { InspectorLookupScreen } from './src/screens/InspectorLookupScreen';
import { InspectorCheckScreen } from './src/screens/InspectorCheckScreen';
import { InspectorDiscrepancyScreen } from './src/screens/InspectorDiscrepancyScreen';
import { ManagerDashboardScreen } from './src/screens/ManagerDashboardScreen';
import { ComingSoonScreen } from './src/screens/ComingSoonScreen';
import { ExitVerificationScreen } from './src/screens/ExitVerificationScreen';
import { VerificationResultScreen } from './src/screens/VerificationResultScreen';
import { StaffDashboardScreen } from './src/screens/StaffDashboardScreen';
import { ProductManagementScreen } from './src/screens/ProductManagementScreen';
import { ProductEditScreen } from './src/screens/ProductEditScreen';
import { ShelfManagementScreen } from './src/screens/ShelfManagementScreen';
import { InventoryAlertScreen } from './src/screens/InventoryAlertScreen';
import { ExitVerificationQueueScreen } from './src/screens/ExitVerificationQueueScreen';
import { PromotionManagementScreen } from './src/screens/PromotionManagementScreen';
import { ManagerAlertCenterScreen } from './src/screens/ManagerAlertCenterScreen';
import { IntegrationStatusScreen } from './src/screens/IntegrationStatusScreen';
import { AuditLogScreen } from './src/screens/AuditLogScreen';
import { BottomNavigation } from './src/components/BottomNavigation';
import { COLORS, SHADOW } from './src/components/Theme';

function MainContainer() {
  const { currentScreen, isLoading, userRole, navigate, session } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.GREEN} />
      </View>
    );
  }

  const renderScreen = () => {
    // 1. Định nghĩa danh sách màn hình được phép cho từng vai trò (RBAC)
    const ALLOWED_SCREENS_BY_ROLE: { [role: string]: any[] } = {
      customer: [
        'welcome', 'session_init', 'home', 'catalog', 'search', 'search_results',
        'product_detail', 'shelf_map', 'scan', 'ai_suggestions', 'cart',
        'checkout_confirm', 'qr_payment', 'payment_success', 'invoice',
        'exit_verification', 'verification_result', 'session_complete'
      ],
      vip: [
        'welcome', 'session_init', 'home', 'catalog', 'search', 'search_results',
        'product_detail', 'shelf_map', 'scan', 'ai_suggestions', 'cart',
        'checkout_confirm', 'qr_payment', 'payment_success', 'invoice',
        'exit_verification', 'verification_result', 'session_complete'
      ],
      register: [
        'welcome', 'session_init'
      ],
      store_staff: [
        'welcome', 'staff_dashboard', 'product_management', 'product_edit',
        'shelf_management', 'inventory_alerts', 'exit_verification_queue', 'integration_status'
      ],
      inspector: [
        'welcome', 'inspector_lookup', 'inspector_check', 'inspector_discrepancy', 'exit_verification_queue'
      ],
      exit_staff: [
        'welcome', 'inspector_lookup', 'inspector_check', 'inspector_discrepancy', 'exit_verification_queue'
      ],
      manager: [
        'welcome', 'manager_dashboard', 'promotion_management', 'manager_alert_center',
        'integration_status', 'audit_log', 'requirement_coverage', 'demo_launcher'
      ],
    };

    // 2. Kiểm tra phân quyền bảo mật (RBAC check)
    const isAllowed = 
      currentScreen === 'welcome' || 
      ALLOWED_SCREENS_BY_ROLE[userRole]?.includes(currentScreen);

    if (!isAllowed) {
      // Trả về màn hình từ chối truy cập Access Denied
      return (
        <SafeAreaView style={rbacStyles.screen}>
          <Ionicons name="lock-closed-outline" size={64} color={COLORS.RED} />
          <Text style={rbacStyles.title}>TỪ CHỐI TRUY CẬP (ACCESS DENIED) 🚫</Text>
          <Text style={rbacStyles.sub}>
            Hệ thống phát hiện tài khoản của bạn (Vai trò: <Text style={{ fontWeight: 'bold', color: COLORS.RED }}>{userRole.toUpperCase()}</Text>) không có quyền truy cập chức năng này.
          </Text>
          <Pressable
            style={rbacStyles.btn}
            onPress={() => {
              if (userRole === 'manager') navigate('manager_dashboard');
              else if (userRole === 'store_staff') navigate('staff_dashboard');
              else if (userRole === 'inspector' || userRole === 'exit_staff') navigate('inspector_lookup');
              else if (userRole === 'register') navigate('session_init');
              else navigate(session ? 'home' : 'welcome');
            }}
          >
            <Text style={rbacStyles.btnText}>Quay lại trang chính tương ứng</Text>
          </Pressable>
        </SafeAreaView>
      );
    }

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'session_init':
        return <SessionInitScreen />;
      case 'home':
        return <HomeScreen />;
      case 'cart':
        return <CartScreen />;
      case 'catalog':
        return <CatalogScreen />;
      case 'search':
      case 'search_results':
        return <SearchScreen />;
      case 'product_detail':
        return <ProductDetailScreen />;
      case 'shelf_map':
        return <ShelfMapScreen />;
      case 'scan':
        return <ScanScreen />;
      case 'ai_suggestions':
        return <AISuggestionScreen />;
      case 'checkout_confirm':
        return <CheckoutScreen />;
      case 'qr_payment':
        return <QRPaymentScreen />;
      case 'invoice':
        return <InvoiceScreen />;
      case 'exit_verification':
        return <ExitVerificationScreen />;
      case 'verification_result':
        return <VerificationResultScreen />;
      case 'inspector_lookup':
        return <InspectorLookupScreen />;
      case 'inspector_check':
        return <InspectorCheckScreen />;
      case 'inspector_discrepancy':
        return <InspectorDiscrepancyScreen />;
      case 'manager_dashboard':
        return <ManagerDashboardScreen />;
      case 'staff_dashboard':
        return <StaffDashboardScreen />;
      case 'product_management':
        return <ProductManagementScreen />;
      case 'product_edit':
        return <ProductEditScreen />;
      case 'shelf_management':
        return <ShelfManagementScreen />;
      case 'inventory_alerts':
        return <InventoryAlertScreen />;
      case 'exit_verification_queue':
        return <ExitVerificationQueueScreen />;
      case 'promotion_management':
        return <PromotionManagementScreen />;
      case 'manager_alert_center':
        return <ManagerAlertCenterScreen />;
      case 'integration_status':
        return <IntegrationStatusScreen />;
      case 'audit_log':
        return <AuditLogScreen />;
      default:
        // Phục vụ làm màn hình chờ/Coming soon cho các màn hình Giai đoạn sau
        return <ComingSoonScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <BottomNavigation />
    </View>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <MainContainer />
      </SafeAreaView>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
});

const rbacStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.RED,
    textAlign: 'center',
  },
  sub: {
    fontSize: 11,
    color: COLORS.MUTED,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  btn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
    marginTop: 10,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
