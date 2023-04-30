import { AppBskyActorProfile, AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, ProfileRecord } from "atproto/packages/api";
import { FeedViewPost, PostView, ReasonRepost, isReasonRepost } from "atproto/packages/api/src/client/types/app/bsky/feed/defs";
import { ReasonType } from "atproto/packages/api/src/client/types/com/atproto/moderation/defs";
import cn from 'classnames';
import Markdown from 'markdown-to-jsx';
import React, { SyntheticEvent, useEffect, useReducer, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AvatarPlaceholder from '../../assets/placeholder.png';
import RepostIcon from '../../assets/repost-fill.svg';
import fromNow from '../../utils/fromNow';
import linkFromPost from "../../utils/linkFromPost";
import renderMarkdown from "../../utils/renderMarkdown";
import styles from './Blue.module.scss';
import Comments from "./Comments";
import External from "./Embed/External";
import Image from "./Embed/Image";
import Record from "./Embed/Record";
import Like from "./Like";
import Repost from "./Repost";

export default function Blue(props: {
    post: FeedViewPost | PostView,
    isReply?: boolean,
    isParent?: boolean,
    isSingle?: boolean,
    reason?: ReasonType | any,
    className?: string
}) {
    const { post, isReply, isParent, isSingle, reason, className } = props;
    const elementRef = useRef<any>(null);
    if (!post) return <div ref={elementRef} className={cn(styles.blue, styles.deleted, className, { [styles.isReply]: isReply, [styles.parent]: isParent, [styles.single]: isSingle })}>
        <p>This Skeet Is Deleted</p>
    </div>;

    const navigate = useNavigate();
    const embed = post?.embed as AppBskyEmbedImages.View | AppBskyEmbedExternal.View | AppBskyEmbedRecord.View | AppBskyEmbedRecordWithMedia.View;
    const author = post?.author as AppBskyActorProfile.Record;


    const [markdown, setMarkdown] = useState('');
    const markdownText = () => {
        const res = renderMarkdown((post?.record as any)?.text);
        setMarkdown(res);
    };

    const _handleSingleScroll = () => {
        if (!isSingle) return;
        (elementRef.current as HTMLElement).scrollIntoView({
            behavior: 'auto',
            inline: 'start'
        });
    };

    useEffect(() => {
        markdownText();
        _handleSingleScroll();
    }, []);

    const _linkToUserProfile = (e: SyntheticEvent | any) => {
        e.preventDefault();
        e.stopPropagation();
        const userLink = `/user/${(post.author as any).handle}`;
        if (e.ctrlKey) {
            window.open(userLink, "_blank");
        } else {
            navigate(userLink);
        }
    };

    return (
        !post ? <p>Not Found</p> : <>
            <div ref={elementRef} className={cn(styles.blue, className, { [styles.isReply]: isReply, [styles.parent]: isParent, [styles.single]: isSingle })} onClick={(e: any) => {
                if (isSingle) {
                    return e.preventDefault();
                }

                if (e.target.tagName != 'A' && e.target.tagName != 'IMG') {
                    if (e.ctrlKey) {
                        window.open(linkFromPost(post), "_blank");
                    } else {
                        navigate(linkFromPost(post));
                    }
                }
            }}>
                {reason ? <div className={styles.reasonRepost}>
                    <div>
                        <img src={RepostIcon} />
                        Reposted By {(reason as ReasonRepost).by.displayName}
                    </div>
                </div>
                    : ''}
                <div className={styles.avatar} onClick={_linkToUserProfile}>
                    <img src={author.avatar || AvatarPlaceholder as any} />
                </div>
                <div className={styles.body}>
                    <div className={styles.header}>
                        <div>
                            <strong>{author.displayName}</strong>
                            <span>{(author.handle as string)}</span>
                        </div>
                        {post.indexedAt ? <span>{fromNow(new Date((post.indexedAt as string)))}</span> : ''}
                    </div>
                    {/* <p dir="auto"> */}
                    {markdown ? <Markdown options={{
                        forceBlock: true,
                        overrides: {
                            p: {
                                props: {
                                    dir: "auto"
                                }
                            }
                        }
                    }}>{markdown?.replace(/\n/g, ' <br/> ') || ''}</Markdown> : <p>{(post?.record as any)?.text}</p>}
                    {/* </p> */}
                    {embed ? <div>
                        {embed.external ? <External embed={(embed as AppBskyEmbedExternal.View)} /> : ''}
                        {embed.images ? <Image embed={(embed as AppBskyEmbedImages.View)} /> : ''}
                        {embed.media ? <Image embed={(embed as AppBskyEmbedImages.View)} /> : ''}
                        {embed.record ? <Record embed={(embed as AppBskyEmbedRecord.View)} /> : ''}
                    </div> : ''}
                    <div className={styles.footer}>
                        <Comments post={post} />
                        <Repost post={post} />
                        <Like post={post} />
                    </div>
                </div>
            </div>
        </>
    );
}