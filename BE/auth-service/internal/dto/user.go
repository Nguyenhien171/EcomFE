// internal/dto/user.go
package dto

import "go.mongodb.org/mongo-driver/bson/primitive"

type CreateUserRequest struct {
    Username string             `json:"username"`
    Email    string             `json:"email"`
    Password string             `json:"password"`
    Role     primitive.ObjectID `json:"role"`
}
type UpdateUserRequest struct {
    ID       primitive.ObjectID `json:"id"`
    Username string             `json:"username"`
    Email    string             `json:"email"`
    Role     primitive.ObjectID `json:"role"`
}
type UserResponse struct {
    ID       primitive.ObjectID `json:"id"`
    Username string             `json:"username"`
    Email    string             `json:"email"`
    Role     string             `json:"role"`
}
type ListUsersResponse struct {
    Users []UserResponse `json:"users"`
}
type Empty struct{}
