import UserDto from "../dtos/user-dto";

const formatUser = (user: UserDto, hashedPassword: string) => {
    const {confirmPassword, ...userData} = user;
    userData.password = hashedPassword;
    userData.role = userData.role.toUpperCase();
    return Object.values(userData);
}
export default formatUser;