// @flow
import * as React from 'react';
import { FlatList } from 'react-native';

import Activity from './Activity';
import NewActivitiesNotification from './NewActivitiesNotification';

import { Feed, FeedContext } from '../Context';
import { buildStylesheet } from '../styles';
import { smartRender } from '../utils';

import type {
  BaseActivityResponse,
  BaseReaction,
  NavigationScreen,
  StyleSheetLike,
  BaseFeedCtx,
  BaseClient,
  Renderable,
} from '../types';
import type {
  FeedRequestOptions,
  FeedResponse,
  ActivityResponse,
} from 'getstream';

type Props = {|
  feedGroup: string,
  userId?: string,
  /** read options for the API client (eg. limit, ranking, ...) */
  options?: FeedRequestOptions,
  Activity: Renderable,
  /** the component to use to render new activities notification */
  Notifier: Renderable,
  /** if true, feed shows the Notifier component when new activities are added */
  notify: boolean,
  //** the element that renders the feed footer */
  Footer?: Renderable,
  //** the feed read hander (change only for advanced/complex use-cases) */
  doFeedRequest?: (
    client: BaseClient,
    feedGroup: string,
    userId?: string,
    options?: FeedRequestOptions,
  ) => Promise<FeedResponse<{}, {}>>,
  /** Override reaction add request */
  doReactionAddRequest?: (
    kind: string,
    activity: BaseActivityResponse,
    data?: {},
    options: {},
  ) => mixed,
  /** Override reaction delete request */
  doReactionDeleteRequest?: (id: string) => mixed,
  /** Override child reaction add request */
  doChildReactionAddRequest?: (
    kind: string,
    activity: BaseReaction,
    data?: {},
    options: {},
  ) => mixed,
  /** Override child reaction delete request */
  doChildReactionDeleteRequest?: (id: string) => mixed,
  /** Override reactions filter request */
  doReactionsFilterRequest?: (options: {}) => Promise<Object>,
  //** turns off pagination */
  noPagination?: boolean,
  analyticsLocation?: string,
  onRefresh?: () => mixed,
  children?: React.Node,
  styles?: StyleSheetLike,
  navigation?: NavigationScreen,
  /** Any props the react native FlatList accepts */
  flatListProps?: {},
  /**
   Using `setListRef` you can set your own reference to the FlatList that's being used inside the FlatFeed. This works as follows:

   `setListRef={(ref) => this.yourRef = ref}`

   One example where this might be needed is when you want to refresh the feed when something happens. Then you can run:

   `this.yourRef.onRefresh(true)`
   */
  setListRef?: (ref: any) => any,
  /** Reverse the order the reactions are displayed in. */
  reverseOrder: boolean,
  /** Function called when an input is focused**/
  onFocusInput?:(index: number, offset: number) => void,
|};

/**
 * Renders a feed of activities, this component is a StreamApp consumer
 * and must always be a child of the <StreamApp> element
 */
export default class FlatFeed extends React.Component<Props> {
  static defaultProps = {
    styles: {},
    feedGroup: 'timeline',
    notify: false,
    Activity,
    Notifier: NewActivitiesNotification,
    reverseOrder: false,
  };

  render() {
    return (
      <Feed
        feedGroup={this.props.feedGroup}
        userId={this.props.userId}
        options={this.props.options}
        notify={this.props.notify}
        doFeedRequest={this.props.doFeedRequest}
        doReactionAddRequest={this.props.doReactionAddRequest}
        doReactionDeleteRequest={this.props.doReactionDeleteRequest}
        doChildReactionAddRequest={this.props.doChildReactionAddRequest}
        doChildReactionDeleteRequest={this.props.doChildReactionDeleteRequest}
        doReactionsFilterRequest={this.props.doReactionsFilterRequest}
      >
        <FeedContext.Consumer>
          {(feedCtx) => <FlatFeedInner {...this.props} {...feedCtx} />}
        </FeedContext.Consumer>
      </Feed>
    );
  }
}

type PropsInner = {| ...Props, ...BaseFeedCtx |};
class FlatFeedInner extends React.Component<PropsInner> {
  _refresh = async () => {
    this._scrollToTop();
    await this.props.refresh(this.props.options);
    this._scrollToTop();
  };

  _scrollToTop() {
    // $FlowFixMe
    const ref = this.listRef;
    if (ref) {
      ref.scrollToOffset({ offset: 0 });
    }
  }
  async componentDidMount() {
    await this._refresh();
  }

  _renderWrappedActivity = ({ item, index }: { item: any, index:number }) => (
    <ImmutableItemWrapper
      renderItem={(i)=>this._renderActivity(i, index)}
      item={item}
      navigation={this.props.navigation}
      feedGroup={this.props.feedGroup}
      userId={this.props.userId}
    />
  );

  _childProps = () => ({
    onRemoveActivity: this.props.onRemoveActivity,
    onToggleReaction: this.props.onToggleReaction,
    onAddReaction: this.props.onAddReaction,
    onRemoveReaction: this.props.onRemoveReaction,
    onToggleChildReaction: this.props.onToggleChildReaction,
    onAddChildReaction: this.props.onAddChildReaction,
    onRemoveChildReaction: this.props.onRemoveChildReaction,
    navigation: this.props.navigation,
    feedGroup: this.props.feedGroup,
    userId: this.props.userId,
  });

  _renderActivity = (item: ActivityResponse<Object, Object>, index:number) => {
    const args = {
      activity: item,
      // $FlowFixMe
      styles: this.props.styles.activity,
      index: index,
      onCommentFocus: this.props.onFocusInput,
      ...this._childProps(),
    };

    return smartRender(this.props.Activity, { ...args });
  };

  render() {
    const styles = buildStylesheet('flatFeed', this.props.styles);
    const notifierProps = {
      adds: this.props.realtimeAdds,
      deletes: this.props.realtimeDeletes,
      onPress: this._refresh,
    };
    return (
      <React.Fragment>
        {smartRender(this.props.Notifier, notifierProps)}
        <FlatList
          ListHeaderComponent={this.props.children}
          style={styles.container}
          refreshing={this.props.refreshing}
          onRefresh={this.props.onRefresh || this.props.refresh}
          data={this.props.activityOrder.map((id) =>
            this.props.activities.get(id),
          )}
          inverted={this.props.reverseOrder}
          keyExtractor={(item) => item.get('id')}
          renderItem={this._renderWrappedActivity}
          onEndReached={
            this.props.noPagination ? undefined : this.props.loadNextPage
          }
          ref={(ref) => {
            this.props.setListRef === undefined
              ? null
              : this.props.setListRef(ref);
            // $FlowFixMe
            this.listRef = ref;
          }}
          {...this.props.flatListProps}
        />
        {smartRender(this.props.Footer, this._childProps())}
      </React.Fragment>
    );
  }
}

type ImmutableItemWrapperProps = {
  renderItem: (item: any) => any,
  item: any,
};

class ImmutableItemWrapper extends React.PureComponent<ImmutableItemWrapperProps> {
  render() {
    return this.props.renderItem(this.props.item.toJS());
  }
}
