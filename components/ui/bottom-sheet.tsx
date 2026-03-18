import { ReactNode, useEffect } from 'react'
import { Dimensions, PanResponder, Pressable, StyleSheet, View } from 'react-native'
import { KeyboardStickyView } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const SCREEN_HEIGHT = Dimensions.get('window').height

type BottomSheetProps = {
    content: ReactNode
    isClosing: boolean
    onClose: () => void
}

export const BottomSheet = ({ content, isClosing, onClose }: BottomSheetProps) => {
    const dragY = useSharedValue(SCREEN_HEIGHT)
    const overlayOpacity = useSharedValue(0)

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: dragY.value }],
    }))

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }))

    useEffect(() => {
        if (isClosing) {
            closeWithAnimation()
        }
    }, [isClosing])

    useEffect(() => {
        dragY.value = withTiming(0, { duration: 300 })
        overlayOpacity.value = withTiming(1, { duration: 300 })
    }, [])

    const closeWithAnimation = () => {
        overlayOpacity.value = withTiming(0, { duration: 250 })
        dragY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
            scheduleOnRN(onClose)
        })
    }

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
        onPanResponderMove: (_, gesture) => {
            if (gesture.dy > 0) dragY.value = gesture.dy
        },
        onPanResponderRelease: (_, gesture) => {
            if (gesture.dy > 120) {
                scheduleOnRN(closeWithAnimation)
            } else {
                dragY.value = withSpring(0)
            }
        },
    })

    return (
        <KeyboardStickyView style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Pressable style={StyleSheet.absoluteFill} onPress={closeWithAnimation}>
                <Animated.View style={[styles.overlay, overlayStyle]} />
            </Pressable>
            <Animated.View {...panResponder.panHandlers} style={[styles.sheet, sheetStyle]}>
                <View style={styles.handle} />
                {content}
                <View style={styles.bottom} />
            </Animated.View>
        </KeyboardStickyView>
    )
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 48,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 20,
    },
    handle: {
        alignSelf: 'center',
        width: 48,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#d1d5db',
        marginBottom: 16,
    },
    bottom: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -500,
        backgroundColor: '#fff',
        height: 500,
    },
})
