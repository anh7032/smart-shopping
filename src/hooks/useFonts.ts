import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

// Hook để load fonts và trạng thái loading
export function useFonts() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        // Load fonts hỗ trợ tiếng Việt
        await Font.loadAsync({
          // System fonts đã hỗ trợ tiếng Việt trên iOS/Android
          // Nếu cần custom fonts, thêm vào đây
          // 'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
          // 'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Lỗi load fonts:', error);
        setFontError(error as Error);
        // Vẫn cho phép app chạy dù font lỗi
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
}
