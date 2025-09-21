import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // Animation values for floating tab design
  const containerScale = useSharedValue(1);
  const practiceButtonScale = useSharedValue(1);
  
  // Filter out progress and index tabs and get visible tabs
  const visibleRoutes = state.routes.filter(route => 
    route.name !== 'progress' && 
    route.name !== 'index'
  );
  const tabWidth = (width - 200) / visibleRoutes.length; // Account for practice button space

  const handlePracticePress = () => {
    practiceButtonScale.value = withSpring(0.9, { damping: 8, stiffness: 500 }, () => {
      practiceButtonScale.value = withSpring(1.05, { damping: 12, stiffness: 300 }, () => {
        practiceButtonScale.value = withSpring(1, { damping: 15, stiffness: 200 });
      });
    });
    router.push('/camera-practice' as any);
  };

  return (
    <View style={[styles.outerContainer, { paddingBottom: insets.bottom + 16 }]}>
      {/* Main floating container */}
      <Animated.View style={[styles.floatingContainer]}>
        {/* Backdrop blur */}
        <BlurView
          intensity={colorScheme === 'light' ? 80 : 95}
          tint={colorScheme === 'light' ? 'systemThinMaterialDark' : 'systemUltraThinMaterialLight'}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Background gradient overlay */}
        <LinearGradient
          colors={colorScheme === 'dark' 
            ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']
            : [colors.tabBarBackground || 'rgba(255,255,255,0.95)', colors.tabBarBackgroundSecondary || 'rgba(250,251,252,0.9)']
          }
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.tabRow}>
          {/* Left side tabs */}
          <View style={styles.leftTabs}>
            {visibleRoutes.slice(0, Math.ceil(visibleRoutes.length / 2)).map((route, index) => (
              <TabItem
                key={route.key}
                route={route}
                descriptor={descriptors[route.key]}
                navigation={navigation}
                isFocused={state.routes[state.index].key === route.key}
                colors={colors}
                tabWidth={tabWidth}
              />
            ))}
          </View>

          {/* Enhanced Center Practice Button */}
          <Animated.View style={[{ transform: [{ scale: practiceButtonScale }] }]}>
            <View style={styles.practiceButtonWrapper}>
              {/* Glowing ring effect */}
              <View style={[
                styles.practiceButtonGlow,
                {
                  borderColor: colorScheme === 'dark' 
                    ? 'rgba(240,230,140,0.3)' 
                    : `${colors.practiceGlow || '#F0E68C'}40`,
                  shadowColor: colors.practiceGlow || '#F0E68C',
                }
              ]} />
              
              <TouchableOpacity
                style={styles.practiceButton}
                onPress={handlePracticePress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={colorScheme === 'dark' 
                    ? [colors.practiceGradientStart || '#334155', colors.practiceGradientEnd || '#334155']
                    : [colors.practiceGradientStart || '#FFFFFF', colors.practiceGradientEnd || '#FFFFFF']
                  }
                  style={styles.practiceGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Inner highlight */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.8)', 'transparent']}
                    style={styles.practiceHighlight}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 0 }}
                  />
                  
                  <View style={styles.practiceInner}>
                    <View style={styles.practiceIconContainer}>
                      <Image
                      source={require('@/assets/SpotLightLogo.png')}
                      style={{ width: 26, height: 26 }}
                      resizeMode="contain"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Right side tabs */}
          <View style={styles.rightTabs}>
            {visibleRoutes.slice(Math.ceil(visibleRoutes.length / 2)).map((route, index) => (
              <TabItem
                key={route.key}
                route={route}
                descriptor={descriptors[route.key]}
                navigation={navigation}
                isFocused={state.routes[state.index].key === route.key}
                colors={colors}
                tabWidth={tabWidth}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Individual tab item component with modern design
function TabItem({ route, descriptor, navigation, isFocused, colors, tabWidth }: any) {
  const scaleValue = useSharedValue(isFocused ? 1 : 0.9);
  const backgroundOpacity = useSharedValue(isFocused ? 1 : 0);
  const iconScale = useSharedValue(isFocused ? 1.1 : 1);

  const { options } = descriptor;
  const label = typeof options.tabBarLabel === 'string' 
    ? options.tabBarLabel 
    : options.title ?? route.name;

  React.useEffect(() => {
    scaleValue.value = withSpring(isFocused ? 1 : 0.9, {
      damping: 15,
      stiffness: 200,
    });
    backgroundOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 300 });
    iconScale.value = withSpring(isFocused ? 1.1 : 1, {
      damping: 12,
      stiffness: 300,
    });
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const onPress = () => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <AnimatedTouchableOpacity
      style={[styles.tabItem, animatedContainerStyle]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Active background */}
      <Animated.View style={[styles.activeBackground, animatedBackgroundStyle]}>
        <LinearGradient
          colors={[`${colors.tint}15`, `${colors.accent}20`]}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      {/* Icon container */}
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        {options.tabBarIcon &&
          options.tabBarIcon({
            focused: isFocused,
            color: isFocused ? colors.tint : colors.tabIconDefault,
            size: 22,
          })}
      </Animated.View>

      {/* Label */}
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? colors.tint : colors.tabIconDefault,
            fontWeight: isFocused ? '600' : '500',
          },
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingContainer: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#F0E68C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 16,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    height: 76,
  },
  leftTabs: {
    flex: 1,
    flexDirection: 'row',
  },
  rightTabs: {
    flex: 1,
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    position: 'relative',
  },
  activeBackground: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  iconContainer: {
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  practiceButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  practiceButtonGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  practiceButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#F0E68C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  practiceGradient: {
    flex: 1,
    borderRadius: 28,
    position: 'relative',
  },
  practiceHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  practiceInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceIconContainer: {
    transform: [{ translateY: 1 }],
  },
});
