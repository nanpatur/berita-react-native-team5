/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Button,
  DrawerLayoutAndroid,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

const imagePlaceholder = 'https://via.placeholder.com/240x150';

const CardNews = ({news}) => {
  const dateOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const handleLinkPress = useCallback(async () => {
    await Linking.openURL(news.link);
  }, [news.link]);

  return (
    <TouchableOpacity
      style={styles.cardNewsContainer}
      onPress={handleLinkPress}>
      <Image
        style={{
          width: 120,
          height: 120,
          marginEnd: 12,
        }}
        source={{
          uri:
            typeof news.image === 'string'
              ? news.image || imagePlaceholder
              : news.image?.small || news.image?.large || imagePlaceholder,
        }}
      />
      <View style={{flex: 1}}>
        <Text style={{color: '#000', fontWeight: 'bold', marginBottom: 4}}>
          {news.title}
        </Text>
        <Text style={{fontSize: 10, marginBottom: 4}}>
          {new Date(news.isoDate).toLocaleDateString('id-ID', dateOptions)}
        </Text>
        <Text style={{color: '#000', fontSize: 12}}>
          {(news?.contentSnippet || news?.content).slice(0, 90)}...
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [sourceList, setSourceList] = useState([]);
  const [newsList, setNewsList] = useState([]);
  const [isLoadingSourceList, setIsLoadingSourceList] = useState(false);
  const [isLoadingNewsList, setIsLoadingNewsList] = useState(false);
  const [selectedSource, setSelectedSource] = useState();
  const [selectedType, setSelectedType] = useState();

  const drawer = useRef(null);

  useEffect(() => {
    const getSourceList = async () => {
      setIsLoadingSourceList(true);
      fetch('http://localhost:8000')
        .then(response => response.json())
        .then(data => {
          setSourceList(data?.listApi || []);
          setSelectedSource(Object.keys(data.listApi)[0]);
          setIsLoadingSourceList(false);
        })
        .catch(error => {
          console.log(error);
          setIsLoadingSourceList(false);
        });
    };
    getSourceList();
  }, []);

  const selectedNewsDetail = useMemo(
    () => selectedSource && sourceList[selectedSource],
    [selectedSource, sourceList],
  );

  useEffect(() => {
    if (selectedNewsDetail) {
      const getAllNews = async () => {
        setIsLoadingNewsList(true);
        fetch(
          selectedType
            ? selectedNewsDetail.all + selectedType
            : selectedNewsDetail.all,
        )
          .then(response => response.json())
          .then(data => {
            setNewsList(data?.data || []);
            setIsLoadingNewsList(false);
          });
      };
      getAllNews();
    }
  }, [selectedNewsDetail, selectedType]);

  const SourceItem = ({text, onPress, backgroundColor, textColor}) => (
    <TouchableOpacity onPress={onPress} style={{backgroundColor, padding: 10}}>
      <Text style={{color: textColor}}>{text}</Text>
    </TouchableOpacity>
  );

  const navigationView = () => (
    <View style={[styles.container]}>
      <ScrollView>
        {isLoadingSourceList && (
          <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
            Loading...
          </Text>
        )}
        {!isLoadingSourceList &&
          Object.keys(sourceList)?.map(source => {
            const backgroundColor = source === selectedSource ? 'blue' : '#fff';
            const color = source === selectedSource ? '#fff' : 'black';
            return (
              <SourceItem
                key={source}
                text={source}
                backgroundColor={backgroundColor}
                textColor={color}
                onPress={() => {
                  drawer.current.closeDrawer();
                  setSelectedSource(source);
                }}
              />
            );
          })}
      </ScrollView>
      <Button title="Tutup" onPress={() => drawer.current.closeDrawer()} />
    </View>
  );

  return (
    <DrawerLayoutAndroid
      ref={drawer}
      drawerWidth={300}
      drawerPosition={'right'}
      renderNavigationView={navigationView}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.navbarContainer}>
        <Text style={styles.title}>Portal Berita</Text>
        <Button
          title="Pilih Sumber"
          onPress={() => drawer.current.openDrawer()}
        />
      </View>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View
          style={{
            padding: 12,
          }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12,
              color: '#000',
            }}>
            {selectedSource}
          </Text>
          {!isLoadingSourceList && (
            <SelectDropdown
              data={selectedNewsDetail?.listType || []}
              onSelect={selectedItem => {
                setSelectedType(selectedItem);
              }}
              buttonTextAfterSelection={(selectedItem, index) => {
                return selectedItem.toUpperCase();
              }}
              rowTextForSelection={(item, index) => {
                return item.toUpperCase();
              }}
              dropdownIconPosition="right"
              defaultButtonText="Pilih Tipe Berita"
              buttonStyle={{
                backgroundColor: '#fff',
                width: '100%',
                marginBottom: 12,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc',
              }}
              buttonTextStyle={{
                fontSize: 14,
              }}
              selectedRowStyle={{
                backgroundColor: '#0d6efd',
              }}
              selectedRowTextStyle={{
                color: '#fff',
              }}
              rowTextStyle={{
                fontSize: 14,
              }}
              renderCustomizedButtonChild={item => (
                <View style={{flexDirection: 'row'}}>
                  {item ? (
                    <Text style={{color: '#000'}}>{item?.toUpperCase()}</Text>
                  ) : (
                    <Text>{'Pilih tipe berita'}</Text>
                  )}
                </View>
              )}
            />
          )}
          {isLoadingNewsList && (
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
              Loading...
            </Text>
          )}
          {!isLoadingNewsList &&
            newsList.map(news => <CardNews key={news.id} news={news} />)}
          {!isLoadingNewsList && newsList.length === 0 && (
            <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
              Tidak ada berita
            </Text>
          )}
        </View>
      </ScrollView>
    </DrawerLayoutAndroid>
  );
};

const styles = StyleSheet.create({
  cardNewsContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#eee',
    flexDirection: 'row',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  highlight: {
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  navbarContainer: {
    backgroundColor: '#0d6efd',
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  sourceItem: {
    paddingHorizontal: 10,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});

export default App;
