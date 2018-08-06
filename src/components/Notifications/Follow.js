import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

import Avatar from '../Avatar';

const Follow = ({ items, onPressAvatar }) => {
  return (
    <View style={styles.item}>
      {items.length !== 1 ? (
        <Image
          style={styles.icon}
          source={require('../../images/icons/followers.png')}
        />
      ) : (
        <TouchableOpacity onPress={() => onPressAvatar(items[0].user_id)}>
          <Avatar source={items[0].user_image} size={48} noShadow />
        </TouchableOpacity>
      )}

      <View style={{ flex: 1, paddingLeft: 15 }}>
        <View style={{ flexDirection: 'row' }}>
          {items.length > 1
            ? items.map((item) => {
                return (
                  <TouchableOpacity
                    onPress={() => onPressAvatar(item.user_id)}
                    style={styles.follow}
                    key={item.user_id}
                  >
                    <Avatar source={item.user_image} size={29} noShadow />
                  </TouchableOpacity>
                );
              })
            : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            <Text style={styles.footerTextBold}>@{items[0].user_name}</Text>
            {items.length > 1
              ? ' and ' + (items.length - 1) + ' others'
              : null}{' '}
            followed you
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#DADFE3',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
  },
  icon: {
    width: 48,
    height: 48,
  },
  follow: {
    marginRight: 5,
  },
  object: {},
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 13,
    color: '#535B61',
  },
  footerTextBold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#535B61',
  },
  objectFooterTimestamp: {
    fontSize: 13,
    color: '#535B61',
  },
});

export default Follow;