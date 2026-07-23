import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { mockProducts } from '../data/mockProducts';
import { Product } from '../types';
import { COLORS, SHADOW, TOP_INSET, money } from '../components/Theme';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  products?: Product[];
  isCombo?: boolean;
}

const QUICK_PROMPTS = [
  'Gợi ý bữa sáng dưới 100k',
  'Mua gì ăn kèm thịt bò?',
  'Sản phẩm giảm giá sâu hôm nay',
];

export const AISuggestionScreen: React.FC = () => {
  const { addToCart, navigate, cart } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Keyboard show/hide listeners with smooth platform-specific event mapping
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(
      showEvent,
      () => setKeyboardVisible(true)
    );
    const hideSubscription = Keyboard.addListener(
      hideEvent,
      () => setKeyboardVisible(false)
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Dynamically generate the greeting based on the active cart and history!
  useEffect(() => {
    let welcomeText = 'Xin chào! Tôi là Trợ lý ảo SmartCart AI. 🤖\n\nTôi có thể giúp bạn lên thực đơn, gợi ý bữa ăn tiện lợi, hoặc đề xuất sản phẩm tiết kiệm hôm nay! Hãy gõ tin nhắn hoặc bấm các gợi ý nhanh bên dưới nhé.';
    
    const cartIds = cart.map(item => item.id);
    if (cartIds.includes('thit-bo-uc')) {
      welcomeText += '\n\n💡 Tôi phát hiện bạn đang có *Thịt bò Úc* trong giỏ hàng. Bạn có muốn nấu món **Ba chỉ bò xào rau cải xanh** không? Tôi khuyên bạn mua kèm *Rau cải xanh organic (Dãy A3 - Kệ số 2)* để có bữa tối hoàn hảo nhé!';
    } else if (cartIds.includes('sua-tuoi-th')) {
      welcomeText += '\n\n💡 Tôi thấy giỏ hàng của bạn đang có *Sữa tươi TH True Milk*. Bạn có muốn kết hợp cùng *Ngũ cốc ăn sáng dinh dưỡng (Dãy C2)* để có bữa sáng bơ sữa thơm ngon tràn đầy năng lượng không?';
    } else if (cartIds.includes('khoai-tay-ong-pringles')) {
      welcomeText += '\n\n💡 Thật tuyệt khi nhâm nhi bánh khoai tây! Bạn có muốn mua kèm *Trà xanh C2 hương chanh (Dãy B2)* để ăn kèm giải nhiệt thanh mát không?';
    } else if (cart.length > 0) {
      welcomeText += `\n\n💡 Hiện giỏ hàng của bạn đang có ${cart.length} sản phẩm. Bạn có thể bấm sang tab "Giỏ hàng" để xem trực tiếp các gợi ý mua sắm thông minh cá nhân hóa của AI nhé!`;
    }

    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
  }, [cart]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // 1. Add User Message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');

    // 2. Trigger simulated typing
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // 3. Process keyword matching for simulated AI replies
      const query = trimmed.toLowerCase();
      let replyText = '';
      let replyProducts: Product[] = [];
      let isCombo = false;

      if (query.includes('sáng') || query.includes('bữa sáng') || query.includes('100') || query.includes('breakfast')) {
        replyText =
          'Dưới đây là thực đơn bữa sáng đầy đủ dinh dưỡng, thơm ngon và tiện lợi dưới 100.000đ dành riêng cho bạn:\n\n1. **Sữa tươi TH True Milk** (28.000đ)\n2. **Bánh mì gối thơm bơ** (25.000đ)\n3. **Ngũ cốc ăn sáng dinh dưỡng** (42.000đ)\n\n**Tổng tiền combo chỉ: 95.000đ!**\nBạn có thể thêm nhanh cả combo này vào giỏ hàng ngay bên dưới nhé.';
        
        // Find TH Milk, Bread, Cereal
        replyProducts = mockProducts.filter((p) =>
          ['sua-tuoi-th', 'banh-mi-sandwich', 'ngu-coc-an-sang'].includes(p.id)
        );
        isCombo = true;
      } else if (query.includes('thịt bò') || query.includes('bò') || query.includes('beef')) {
        replyText =
          'Để chuẩn bị một món bò xào hoặc lẩu bò Úc thơm ngon đúng điệu, tôi gợi ý bạn mua kèm các sản phẩm rau củ tươi xanh hữu cơ và nước tương đậm đà sau đây:\n\n1. **Rau cải xanh organic** (18.000đ)\n2. **Nước tương Chinsu tỏi ớt** (16.000đ)\n\nCả hai đều có sẵn tại Khu thực phẩm tươi và Khu gia vị siêu thị!';
        
        replyProducts = mockProducts.filter((p) =>
          ['rau-cai-organic', 'nuoc-tuong-chinsu'].includes(p.id)
        );
      } else if (
        query.includes('giảm giá') ||
        query.includes('khuyến mãi') ||
        query.includes('tiết kiệm') ||
        query.includes('sale')
      ) {
        replyText =
          'Đây là các mặt hàng đang áp dụng chương trình giảm giá sâu nhất hôm nay, giúp bạn tiết kiệm tối đa hóa đơn mua sắm:\n\n- **Cà chua bi đỏ** (Giảm 29% - Còn 25.000đ)\n- **Xà bông cục Lifebuoy** (Giảm 25% - Còn 15.000đ)\n- **Nước cam ép tươi** (Giảm 22% - Còn 35.000đ)\n- **Dầu gội dưỡng tóc Pantene** (Giảm 21% - Còn 75.000đ)';
        
        replyProducts = mockProducts.filter((p) =>
          ['ca-chua-bi', 'xa-phong-lifebuoy', 'nuoc-cam-ep', 'dau-goi-pantene'].includes(p.id)
        );
      } else {
        replyText =
          'Chào bạn! Tôi có thể gợi ý thực đơn bữa sáng dưới 100k, các món mua kèm với thịt bò, hoặc danh sách sản phẩm đang giảm giá sâu hôm nay. Bạn hãy thử bấm các nút gợi ý nhanh ở trên hoặc gõ từ khóa này nhé!';
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        products: replyProducts,
        isCombo,
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1200);
  };

  const handleAddAllCombo = (products: Product[]) => {
    products.forEach((p) => addToCart(p, 1));
    Alert.alert('Thêm thành công', 'Đã thêm toàn bộ combo bữa sáng vào giỏ hàng của bạn!');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigate('home')}>
          <Ionicons name="arrow-back" size={23} color={COLORS.TEXT} />
        </Pressable>
        <View style={styles.headerTextWrapper}>
          <Text style={styles.headerTitle}>Gợi ý mua sắm AI</Text>
          <Text style={styles.headerSub}>Trợ lý ảo SmartCart AI • Đang hoạt động</Text>
        </View>
        <Pressable style={styles.cartButton} onPress={() => navigate('cart')}>
          <Ionicons name="cart-outline" size={22} color={COLORS.TEXT} />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <View key={msg.id} style={[styles.messageRow, isAI ? styles.msgAIRow : styles.msgUserRow]}>
              {isAI && (
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                </View>
              )}
              <View style={[styles.messageBubble, isAI ? styles.msgAIBubble : styles.msgUserBubble]}>
                <Text style={[styles.messageText, isAI ? styles.msgAIText : styles.msgUserText]}>
                  {msg.text}
                </Text>

                {/* Render Suggested Products inside AI bubble */}
                {msg.products && msg.products.length > 0 && (
                  <View style={styles.productsContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                      {msg.products.map((p) => {
                        const inCart = cart.find((item) => item.id === p.id);
                        return (
                          <View key={p.id} style={styles.aiProductCard}>
                            {p.image ? (
                              <Image source={p.image} style={styles.aiProdImage} />
                            ) : (
                              <View style={styles.aiProdPlaceholder}>
                                <Ionicons name="image" size={20} color={COLORS.MUTED} />
                              </View>
                            )}
                            <View style={styles.aiProdInfo}>
                              <Text style={styles.aiProdName} numberOfLines={1}>
                                {p.name}
                              </Text>
                              <Text style={styles.aiProdPrice}>{money(p.price)}</Text>
                              
                              <Pressable
                                style={[styles.aiProdAddBtn, inCart && styles.aiProdAddBtnActive]}
                                onPress={() => addToCart(p, 1)}
                              >
                                <Ionicons
                                  name={inCart ? 'checkmark' : 'add'}
                                  size={10}
                                  color={inCart ? COLORS.DARK_GREEN : '#FFFFFF'}
                                />
                                <Text style={[styles.aiProdAddBtnText, inCart && styles.aiProdAddBtnTextActive]}>
                                  {inCart ? `Đã thêm (${inCart.quantity})` : 'Thêm giỏ'}
                                </Text>
                              </Pressable>
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>

                    {/* Quick Add entire Combo block */}
                    {msg.isCombo && (
                      <Pressable
                        style={styles.comboAddAllBtn}
                        onPress={() => handleAddAllCombo(msg.products || [])}
                      >
                        <Ionicons name="cart" size={14} color="#FFFFFF" />
                        <Text style={styles.comboAddAllText}>Thêm toàn bộ combo vào giỏ</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                <Text style={styles.timestamp}>{msg.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {/* Loading typing bubble */}
        {isTyping && (
          <View style={[styles.messageRow, styles.msgAIRow]}>
            <View style={styles.aiAvatar}>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
            </View>
            <View style={[styles.messageBubble, styles.msgAIBubble, styles.typingBubble]}>
              <ActivityIndicator size="small" color={COLORS.GREEN} />
              <Text style={styles.typingText}>SmartCart AI đang trả lời...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input area & Quick prompts */}
      <View style={[styles.bottomSection, isKeyboardVisible && { paddingBottom: 12 }]}>
        {/* Quick Prompts Chips scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promptsScroll}
        >
          {QUICK_PROMPTS.map((prompt) => (
            <Pressable
              key={prompt}
              style={styles.promptChip}
              onPress={() => handleSendMessage(prompt)}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Text Input Row */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Hỏi về bữa sáng, bò Úc, hoặc hàng sale..."
            placeholderTextColor="#A1AEA5"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSendMessage(inputText)}
            returnKeyType="send"
          />
          <Pressable
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={() => handleSendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  headerTextWrapper: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.TEXT,
  },
  headerSub: {
    fontSize: 10,
    color: COLORS.GREEN,
    fontWeight: '700',
    marginTop: 2,
  },
  cartButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF2EE',
  },
  cartBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: COLORS.RED,
    minWidth: 16,
    height: 17,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgAIRow: {
    alignSelf: 'flex-start',
    gap: 8,
  },
  msgUserRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...SHADOW,
  },
  msgAIBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  msgUserBubble: {
    backgroundColor: COLORS.GREEN,
    borderTopRightRadius: 4,
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgAIText: {
    color: COLORS.TEXT,
  },
  msgUserText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 8,
    color: COLORS.MUTED,
    alignSelf: 'flex-end',
    marginTop: 6,
    fontWeight: '700',
  },
  productsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    paddingTop: 10,
  },
  productsScroll: {
    gap: 8,
    paddingBottom: 4,
  },
  aiProductCard: {
    width: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    padding: 8,
    ...SHADOW,
  },
  aiProdImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  aiProdPlaceholder: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    backgroundColor: '#E8ECE9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiProdInfo: {
    marginTop: 6,
  },
  aiProdName: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.TEXT,
  },
  aiProdPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.DARK_GREEN,
    marginTop: 2,
  },
  aiProdAddBtn: {
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  aiProdAddBtnActive: {
    backgroundColor: '#F0FAF2',
    borderWidth: 1,
    borderColor: COLORS.GREEN,
  },
  aiProdAddBtnText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  aiProdAddBtnTextActive: {
    color: COLORS.DARK_GREEN,
  },
  comboAddAllBtn: {
    backgroundColor: COLORS.GREEN,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    ...SHADOW,
  },
  comboAddAllText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 11,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingBottom: 88, // Pushes the input bar and prompt chips above the global BottomNavigation (height 76)
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
    ...SHADOW,
  },
  promptsScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  promptChip: {
    backgroundColor: COLORS.LIGHT_GREEN,
    borderWidth: 1.2,
    borderColor: '#BDE3C5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  promptChipText: {
    color: COLORS.DARK_GREEN,
    fontSize: 11,
    fontWeight: '800',
  },
  inputBar: {
    flexDirection: 'row',
    height: 46,
    gap: 8,
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    backgroundColor: '#FAFCFA',
    paddingHorizontal: 16,
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: '600',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  sendButtonDisabled: {
    backgroundColor: '#D2DDD4',
    elevation: 0,
    shadowOpacity: 0,
  },
});
