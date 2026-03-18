import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { Divider } from '@/components/ui/divider'
import { usePlaceStore } from '@/utils/store'

import { SavedLocationsItem } from './components/saved-locations-item'
import { SavedLocationsSearchInput } from './components/saved-locations-search-input'

export const SavedLocations = () => {
    const places = usePlaceStore(state => state.places)
    const [search, setSearch] = useState('')

    const { pinnedPlaces, regularPlaces } = useMemo(() => {
        let result = [...places]

        if (search.trim()) {
            result = result.filter(place => place.name.toLowerCase().includes(search.toLowerCase()))
        }

        const pinned = result.filter(place => place.pinned).sort((a, b) => (b.pinnedAt ?? 0) - (a.pinnedAt ?? 0))
        const regular = result.filter(place => !place.pinned).sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

        return {
            pinnedPlaces: pinned,
            regularPlaces: regular,
        }
    }, [places, search])

    const handleClear = () => {
        setSearch('')
    }

    return (
        <View style={styles.base}>
            {places.length > 0 && (
                <View style={styles.search}>
                    <SavedLocationsSearchInput
                        value={search}
                        isLoading={false}
                        onChange={setSearch}
                        onClear={handleClear}
                    />
                </View>
            )}

            <ScrollView>
                <View style={styles.list}>
                    {pinnedPlaces.length > 0 && (
                        <>
                            {pinnedPlaces.map(place => (
                                <SavedLocationsItem key={place.id} place={place} />
                            ))}
                            <Divider label="Pinned" />
                        </>
                    )}

                    {regularPlaces.map(place => (
                        <SavedLocationsItem key={place.id} place={place} />
                    ))}

                    {places.length > 0 && pinnedPlaces.length === 0 && regularPlaces.length === 0 && (
                        <Text style={styles.empty}>No locations match your search.</Text>
                    )}

                    {places.length === 0 && (
                        <Text style={[styles.empty, { paddingVertical: 16 }]}>You have no saved locations yet.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: '#fff',
    },
    search: {
        padding: 16,
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'column',
        gap: 8,
    },
    empty: {
        fontSize: 14,
        lineHeight: 20,
        color: '#6b7280',
    },
})
