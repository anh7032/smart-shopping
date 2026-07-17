import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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
import { BottomNavigation } from './src/components/BottomNavigation';
import { COLORS } from './src/components/Theme';

function MainContainer() {
  const { currentScreen, isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.GREEN} />
      </View>
    );
  }

  const renderScreen = () => {
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
      case 'inspector_lookup':
        return <InspectorLookupScreen />;
      case 'inspector_check':
        return <InspectorCheckScreen />;
      case 'inspector_discrepancy':
        return <InspectorDiscrepancyScreen />;
      case 'manager_dashboard':
        return <ManagerDashboardScreen />;
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
