import { systemRoles } from '../../utils/systemRoles.js'

export const userApisRole = {
    UPDATE: [systemRoles.USER],
    GET_A_USER: [systemRoles.USER, systemRoles.ADMIN],
    DELETE_A_USER: [systemRoles.USER, systemRoles.ADMIN],
    FOLLOW: [systemRoles.USER],
    UNFOLLOW: [systemRoles.USER],
    RESET_PASSWORD: [systemRoles.USER, systemRoles.ADMIN]
}