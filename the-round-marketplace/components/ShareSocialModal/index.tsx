import { Group } from "@mantine/core";
import { openModal } from "@mantine/modals";
import {
  FacebookIcon,
  FacebookShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "next-share";

export interface ShareSocialModalProps {
  title: string;
  description: string;
  image: string;
  url: string;
  hashtag: string;
}

const showShareSocialModal = ({
  title,
  description,
  image,
  url,
  hashtag,
}: ShareSocialModalProps) => {
  openModal({
    title: `Share Event - ${title}`,
    children: (
      <Group>
        <FacebookShareButton url={url} quote={title} hashtag={hashtag}>
          <FacebookIcon size={32} round={false} borderRadius={6} />
        </FacebookShareButton>
        <RedditShareButton url={url} title={title}>
          <RedditIcon size={32} round={false} borderRadius={6} />
        </RedditShareButton>
        <TelegramShareButton url={url} title={title}>
          <TelegramIcon size={32} round={false} borderRadius={6} />
        </TelegramShareButton>
        <TwitterShareButton url={url} title={title}>
          <TwitterIcon size={32} round={false} borderRadius={6} />
        </TwitterShareButton>
        <ViberShareButton url={url} title={title}>
          <ViberIcon size={32} round={false} borderRadius={6} />
        </ViberShareButton>
        <WhatsappShareButton url={url} title={title} separator=":: ">
          <WhatsappIcon size={32} round={false} borderRadius={6} />
        </WhatsappShareButton>
      </Group>
    ),
  });
};

export default showShareSocialModal;
