//@flow
import * as React from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Linking,
  ImageBackground,
} from 'react-native';

import { humanizeTimestamp } from '../utils';
import ReadMore from 'react-native-read-more-text';

import { buildStylesheet, updateStyle } from '../styles';

import _ from 'lodash';

import ReactionIcon from './ReactionIcon';
import LikeButton from './LikeButton';

import UserBar from './UserBar';
import Card from './Card';
import type {
  ActivityData,
  BaseUserResponse,
} from '../types';
import { smartRender } from '../utils';

type Props = {|
  Header?: Renderable,
    Content ?: Renderable,
    Footer ?: Renderable,
    // The component that displays the url preview
    Card: Renderable,
      onPress ?: () => mixed,
      onPressAvatar ?: () => mixed,
      onPressMention ?: (text: string, activity: {}) => mixed,
      onPressHashtag ?: (text: string, activity: {}) => mixed,
      sub ?: string,
      icon ?: string,
      activity: ActivityData,
        /** Width of an image that's displayed, by default this is
         * the width of the screen */
        imageWidth ?: number,
        /** Styling of the component */
        styles ?: StyleSheetLike,
        /** Handle errors in the render method in a custom way, by
         * default this component logs the error in the console **/
        componentDidCatch ?: (error: Error, info: {}, props: Props) => mixed,
|};

/**
 * Renders feed activities
 * @example ./examples/Activity.md
 */
export default class Activity extends React.Component<Props> {
  static defaultProps = {
    Card,
  };
  componentDidCatch(error: Error, info: {}) {
    if (this.props.componentDidCatch) {
      this.props.componentDidCatch(error, info, this.props);
    } else {
      console.error(error);
      console.error('The following activity caused the previous error');
      console.error(this.props.activity);
    }
  }

  _getOnPress = () => {
    if (this.props.onPress) {
      return this.props.onPress;
    }
  };

  _getOnPressAvatar = () => {
    if (this.props.activity.actor !== 'NotFound' && this.props.onPressAvatar) {
      return this.props.onPressAvatar;
    }
  };

  renderHeader = () => {
    const { time, actor: activityActor } = this.props.activity;
    const notFound = {
      id: '!not-found',
      created_at: '',
      updated_at: '',
      data: { name: 'Unknown', profileImage: '' },
    };
    let actor: BaseUserResponse;
    if (
      typeof activityActor === 'string' ||
      typeof activityActor.error === 'string'
    ) {
      actor = notFound;
    } else {
      //$FlowBug
      actor = (activityActor: any);
    }

    const styles = buildStylesheet('activity', this.props.styles);

    return (
      <View style={styles.header}>
        <UserBar
          username={actor.data.name}
          avatar={actor.data.profileImage}
          subtitle={this.props.sub}
          timestamp={time}
          icon={this.props.icon}
          onPressAvatar={this._getOnPressAvatar()}
        />
      </View>
    );
  };

  onPressMention = (text: string, activity: ActivityData) => {
    if (this.props.onPressMention !== undefined) {
      this.props.onPressMention(text, activity);
      return;
    }
  };

  onPressHashtag = (text: string, activity: ActivityData) => {
    if (this.props.onPressHashtag !== undefined) {
      this.props.onPressHashtag(text, activity);
      return;
    }
  };

  getAndTrimUrl = (text: string, activity: ActivityData) => {
    if (
      activity.attachments &&
      activity.attachments.og &&
      Object.keys(activity.attachments.og).length > 0
    ) {
      const textWithoutUrl = _.replace(text, activity.attachments.og.url, ' ');
      return textWithoutUrl.split(' ');
    } else {
      return text.split(' ');
    }
  };

  renderText = (text: string, activity: ActivityData) => {
    const tokens = text.split(' ');
    const rendered = [];
    const styles = buildStylesheet('activity', this.props.styles);

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i][0] === '@') {
        rendered.push(
          <Text
            style={styles.mention}
            onPress={() => {
              this.onPressMention(tokens[i], activity);
            }}
            key={i}
          >
            {tokens[i]}{' '}
          </Text>,
        );
      } else if (tokens[i][0] === '#') {
        rendered.push(
          <Text
            style={styles.hashtag}
            onPress={() => {
              this.onPressHashtag(tokens[i], activity);
            }}
            key={i}
          >
            {tokens[i]}{' '}
          </Text>,
        );
      } else if (
        activity.attachments &&
        activity.attachments.og &&
        Object.keys(activity.attachments.og).length > 0 &&
        tokens[i] === activity.attachments.og.url
      ) {
        const url = activity.attachments.og.url;
        rendered.push(
          <Text key={i} onPress={() => Linking.openURL(url)} style={styles.url}>
            {tokens[i].slice(0, 20)}
            {tokens[i].length > 20 ? '...' : ''}{' '}
          </Text>,
        );
      } else {
        rendered.push(<Text key={`og-token-${i}`} style={styles.text}>{tokens[i] + ' '}</Text>);
      }
    }
    return rendered;
  };
  
  renderTags = (tags: Array<string>, activity: ActivityData) => {
    if (tags && tags.length >= 1 && tags[0] !== "") {
      const styles = buildStylesheet('activity', this.props.styles);
      const render = tags.map((t, i) => <Text key={`${activity.id}-${i}`} style={styles.hashtag}>{t}</Text>);
      return (<View style={styles.tagsContent}>{render}</View>);
    }
    return null;
  }

  renderContent = () => {
    // return null;
    const width =
      this.props.imageWidth != null
        ? this.props.imageWidth
        : Dimensions.get('window').width;
    const { object, image, attachments, tags } = this.props.activity;
    let { text } = this.props.activity;
    const styles = buildStylesheet('activity', this.props.styles);
    const { Card } = this.props;
    if (text === undefined) {
      if (typeof object === 'string') {
        text = object;
      } else {
        text = '';
      }
    }
    text = text.trim();

    return (
      <View>
        {
          (attachments && attachments.images && attachments.images.length > 0) ?
            (
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.content}>
                  <ReadMore
                    numberOfLines={3}
                    renderTruncatedFooter={this._renderTruncatedFooter}
                    renderRevealedFooter={this._renderRevealedFooter}
                    onReady={this._handleTextReady}>
                    <Text style={styles.text}>
                      {this.renderText(text, this.props.activity)}
                    </Text>
                  </ReadMore>
                </View>

                {this.renderTags(tags, this.props.activity)}

                <ImageBackground
                  {...this.props}
                  style={{ width, height: width, justifyContent: "flex-end" }}
                  source={{ uri: attachments.images[0] }}
                  resizeMethod="resize"
                >
                  <View style={{ flexDirection: "row" }}>
                    <View style={{ flexDirection: "row", flex: 1, marginHorizontal: 20 }}>
                      <LikeButton
                        {...this.props}
                        labelSingle="like"
                        labelPlural="likes"
                        activeImage={this.props.activeLikeImage}
                        inactiveImage={this.props.inactiveLikeImageWhite}
                        styles={{ text: { color: "white" } }}
                      />
                      <ReactionIcon
                        labelSingle="comment"
                        labelPlural="comments"
                        icon={this.props.chatWhiteImage}
                        counts={this.props.activity.reaction_counts}
                        kind="comment"
                        styles={{ text: { color: "white" } }}
                        onPress={this.props.onShowComments}
                      />
                    </View>
                    <View style={{ marginRight: 20 }}>
                      <Text style={{
                        color: "white",
                        paddingTop: 5,
                        paddingBottom: 5,
                        lineHeight: 22,
                        fontSize: 16,
                      }}>
                        {humanizeTimestamp(this.props.time)}
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            ) : (
              <View style={{ flex: 1, flexDirection: 'column' }}>
                <View style={styles.content}>
                  <ReadMore
                    numberOfLines={3}
                    renderTruncatedFooter={this._renderTruncatedFooter}
                    renderRevealedFooter={this._renderRevealedFooter}
                    onReady={this._handleTextReady}>
                    <Text style={styles.text}>
                      {this.renderText(text, this.props.activity)}
                    </Text>
                  </ReadMore>
                </View>
                
                {this.renderTags(tags, this.props.activity)}

                <View style={{
                  borderWidth: 1,
                  borderColor: '#DADADA',
                  marginVertical: 12,
                  marginHorizontal: 20,
                }} />

                <View style={{ flexDirection: "row" }}>
                  <View style={{ flexDirection: "row", flex: 1, marginHorizontal: 20 }}>
                    <LikeButton
                      {...this.props}
                      labelSingle="like"
                      labelPlural="likes"
                      activeImage={this.props.activeLikeImage}
                      inactiveImage={this.props.inactiveLikeImageGray}
                      styles={{ text: { color: "#DADADA" } }}
                    />
                    <ReactionIcon
                      labelSingle="comment"
                      labelPlural="comments"
                      icon={this.props.chatGrayImage}
                      counts={this.props.activity.reaction_counts}
                      kind="comment"
                      styles={{ text: { color: "#DADADA" } }}
                      onPress={this.props.onShowComments}
                    />
                  </View>
                  <View style={{ marginHorizontal: 20 }}>
                    <Text style={{
                      color: "#999999",
                      paddingTop: 5,
                      paddingBottom: 5,
                      lineHeight: 22,
                      fontSize: 16,
                    }}>
                      {humanizeTimestamp(this.props.time)}
                    </Text>
                  </View>
                </View>
              </View>
            )
        }
        {attachments &&
          attachments.og &&
          Object.keys(attachments.og).length > 0 &&
          smartRender(Card, {
            title: attachments.og.title,
            description: attachments.og.description,
            image:
              attachments.og.images && attachments.og.images.length > 0
                ? attachments.og.images[0].image
                : null,
            url: attachments.og.url,
            og: attachments.og,
          })}

        {}
      </View>
    );
  };

  _renderTruncatedFooter = (handlePress) => (
      <Text style={{ color: "gray", marginTop: 5, textDecorationLine: 'underline' }} onPress={handlePress}>
        More
      </Text>
    )

  _renderRevealedFooter = (handlePress) => (
      <Text style={{ color: "gray", marginTop: 5, textDecorationLine: 'underline' }} onPress={handlePress}>
        Less
      </Text>
    )

  renderFooter = () => null;

  render() {
    const { Header, Content, Footer } = this.props;

    const styles = buildStylesheet('activity', this.props.styles);

    return (
      <TouchableOpacity
        style={[styles.container]}
        onPress={this._getOnPress()}
        disabled={!this._getOnPress()}
      >
        {smartRender(Header, {}, this.renderHeader)}
        {smartRender(Content, {}, this.renderContent)}
        {smartRender(Footer, {}, this.renderFooter)}
      </TouchableOpacity>
    );
  }
}
