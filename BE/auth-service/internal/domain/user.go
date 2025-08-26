package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Chuẩn hoá role dạng string cố định
const (
	RoleAdmin   = "ADMIN"
	RoleManager = "MANAGER"
	RoleStaff   = "STAFF"
) 

 
type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserCode  int64              `bson:"userCode" json:"userCode"` // <--- số tăng dần 1,2,3,...
	Username  string             `bson:"username" json:"username"`
	Email     string             `bson:"email" json:"email"`
	Password  string             `bson:"password,omitempty" json:"-"`
	Role      string             `bson:"role" json:"role"` // ADMIN | MANAGER | STAFF
	IsActive  bool               `bson:"isActive" json:"isActive"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type UserEvent struct {
	Type string      `json:"type"`
	User interface{} `json:"user"`
}
