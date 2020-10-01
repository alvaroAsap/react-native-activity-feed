// @flow
import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
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
    onPressRightIcon ?: () => mixed,
    follow ?: boolean,
    styles ?: StyleSheetLike,
    showRightIcon?: boolean,
    rightIconLoading? :boolean,
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
    onPressRightIcon,
    icon,
    tDateTimeParser,
    image,
    font,
    showRightIcon,
    rightIconLoading,
    ...props
  }: Props) => {
    username = username || 'Unknown';
    location = location || '';
    let time = props.time;
    if (time === undefined && props.timestamp != null) {
      time = humanizeTimestamp(props.timestamp, tDateTimeParser);
    }

    const styles = buildStylesheet('userBar', props.styles);

    const customStyles = StyleSheet.create({
      usernameLocation: {
        flexDirection: "column"
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
        { showRightIcon &&
          (rightIconLoading ? 
            <ActivityIndicator color="#008DFF" size="small" />
            :          
            <TouchableOpacity onPress={onPressRightIcon} disabled={!onPressRightIcon}>
              <Image source={image} />
            </TouchableOpacity>
          )
        }
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
