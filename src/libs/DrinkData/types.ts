import type {DrinkKey} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';

type DrinkDataProps = Array<{
  key: DrinkKey;
  icon: IconAsset;
}>;

export default DrinkDataProps;
