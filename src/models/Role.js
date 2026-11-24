import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Role code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    isSystemRole: {
      type: Boolean,
      default: false, // Prevents deleting standard enterprise roles
    },
    permissions: [
      {
        type: String,
        enum: [
          "view",
          "add",
          "edit",
          "update",
          "delete",
          "approve",
          "reject",
          "upload",
          "download",
          "export",
          "manage_users",
          "manage_roles",
          "manage_checksheets",
          "manage_departments",
          "manage_shifts",
          "access_analytics",
          "manage_settings",
          "manage_backups",
          "view_audit_trail",
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ isActive: 1 });

export default mongoose.models.Role || mongoose.model("Role", RoleSchema);
