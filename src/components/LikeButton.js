// @flow
import * as React from 'react';
import { buildStylesheet } from '../styles';
import ReactionToggleIcon from './ReactionToggleIcon';
import type {
  BaseActivityResponse,
  BaseReaction,
  ToggleReactionCallbackFunction,
  ToggleChildReactionCallbackFunction,
  StyleSheetLike,
} from '../types';

type Props = {|
  /** The activity received from Stream that should be liked when pressing the
   * LikeButton. */
  activity: BaseActivityResponse,
    /** The reaction received from Stream that should be liked when pressing the
     * LikeButton. Liking a reaction requires to pass both this field and
     * the `onToggleChildReaction` as well. */
    reaction ?: BaseReaction,
    /** The reactionKind that is used to like, you can for instance set this to
     * `heart`. */
    reactionKind: string,
      /** The function that toggles reactions on activities. */
      onToggleReaction: ToggleReactionCallbackFunction,
        /** The function that toggles reactions on reactions. */
        onToggleChildReaction ?: ToggleChildReactionCallbackFunction,
        /** Styling of the button */
        styles ?: StyleSheetLike,
        /** Active and inactive like icons directories */
        activeImage: string,
          inactiveImage: string,
            /** Action send to get parapoints when you like a post */
            callAction ?: () => void
|};

/**
 * Like button ready to be embedded as Activity footer
 * @example ./examples/LikeButton.md
 */
export default class LikeButton extends React.Component<Props> {
  static defaultProps = {
    reactionKind: 'like',
    activeImage: '../images/icon/heart.png',
    inactiveImage: '../images/icon/heart-outline.png',
  };
  _onPress = () => {
    const {
      activity,
      reaction,
      reactionKind,
      onToggleReaction,
      onToggleChildReaction,
    } = this.props;

    const { callAction } = this.props;

    // Send actions on Comments Screen
    if (reaction && onToggleChildReaction) {
      const own_reactions = reaction.own_children;
      const like = own_reactions && own_reactions[reactionKind] && own_reactions[reactionKind].length == 0;
      return onToggleChildReaction(reactionKind, reaction, {}, {}).then(() => {
        if (callAction)
          like === undefined ? callAction("LIKE", user_id = reaction.user_id) : callAction("LIKE", like, user_id = reaction.user_id);
      }
      );
    }
    // Send actions on Feeds Screen
    const own_reactions = activity.own_reactions;
    const like = own_reactions && own_reactions[reactionKind] && own_reactions[reactionKind].length == 0;
    return onToggleReaction(reactionKind, activity, {}, {}).then(() => {
      if (callAction)
        like === undefined ? callAction("LIKE", user_id = activity.actor.id) : callAction("LIKE", like, user_id = activity.actor.id);
    }
    );
  };

  render() {
    const { activity, reaction, reactionKind } = this.props;
    const styles = buildStylesheet('likeButton', this.props.styles);
    let counts, own_reactions;
    if (reaction && this.props.onToggleChildReaction) {
      counts = reaction.children_counts;
      own_reactions = reaction.own_children;
    } else {
      counts = activity.reaction_counts;
      own_reactions = activity.own_reactions;
    }

    return (
      <ReactionToggleIcon
        styles={styles}
        counts={counts}
        own_reactions={own_reactions}
        kind={reactionKind}
        onPress={this._onPress}
        activeIcon={this.props.activeImage}
        inactiveIcon={this.props.inactiveImage}
        labelSingle={this.props.labelSingle}
        labelPlural={this.props.labelPlural}
        disableText={this.props.disableText}
      />
    );
  }
}
