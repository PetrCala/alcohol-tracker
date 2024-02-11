import {UserId} from './DatabaseCommon';
import DrinkingSesionList from './DrinkingSession';

type UserDrinkingSessions = Record<UserId, DrinkingSesionList>;

export default UserDrinkingSessions;
