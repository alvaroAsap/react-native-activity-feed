// @flow
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { humanizeTimestamp } from '../utils';

import Avatar from './Avatar';
import FollowButton from './FollowButton';
import type { StyleSheetLike } from '../types';
import { buildStylesheet } from '../styles';
import { withTranslationContext } from '../Context';
import type { Streami18Ctx } from '../Context';

type Props = {|
  username: ?string,
    avatar ?: string,
    subtitle ?: string,
    time ?: string, // text that should be displayed as the time
    timestamp ?: string | number, // a timestamp that should be humanized
    icon ?: string,

    onPressAvatar ?: () => mixed,
    follow ?: boolean,
    styles ?: StyleSheetLike,
|} & Streami18Ctx;

/**
 * A compact horizontal user information box (it is used as activities' header)
 * @example ./examples/UserBar.md
 */
const UserBar = withTranslationContext(
  ({
    username,
    location,
    subtitle,
    avatar,
    follow,
    onPressAvatar,
    icon,
    tDateTimeParser,
    image,
    font,
    ...props
  }: Props) => {
    username = username || 'Unknown';
    location = location || 'New York';
    let time = props.time;
    if (time === undefined && props.timestamp != null) {
      time = humanizeTimestamp(props.timestamp, tDateTimeParser);
    }

    const styles = buildStylesheet('userBar', props.styles);

    const customStyles = StyleSheet.create({
      usernameLocation: {
        flexDirection: "row"
      },
      location: {
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontSize: 14,
        lineHeight: 22,
        color: 'gray',
      }

    });

    return (
      <View style={styles.container}>
        {avatar ? (
          <TouchableOpacity onPress={onPressAvatar} disabled={!onPressAvatar}>
            <Avatar
              source={avatar}
              size={48}
              noShadow
              styles={
                (styles && styles.avatar) || { container: { marginRight: 10 } }
              }
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.content}>
          <View style={customStyles.usernameLocation}>
            <Text style={styles.username}>{username}</Text>
            <Text style={customStyles.location}>{location}</Text>
          </View>

          <View style={{ flexDirection: 'row' }}>
            {icon !== undefined ? (
              <Image
                source={icon}
                style={{ width: 24, height: 24, top: -2, marginRight: 5 }}
              />
            ) : null}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {/* {time && (
          <View>
            <Text style={styles.time}>{time}</Text>
          </View>
        )} */}
        <View>
          <Image source={image} />
        </View>
        {/* {follow && (
          <View>
            <FollowButton followed />
          </View>
        )} */}
      </View>
    );
  },
);

export default UserBar;
