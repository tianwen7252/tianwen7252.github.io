import React from 'react'
import { UserOutlined } from '@ant-design/icons'

interface AvatarImageProps {
  /** Stored avatar value: image path, http URL, or empty/undefined for fallback */
  avatar?: string
  /** Avatar size in pixels (default 36) */
  size?: number
}

// Render an avatar based on stored value: image path, http URL, or fallback icon
export const AvatarImage: React.FC<AvatarImageProps> = ({ avatar, size = 36 }) => {
  if (avatar && (avatar.startsWith('images/') || avatar.startsWith('http'))) {
    return (
      <img
        src={avatar}
        alt="avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
      />
    )
  }

  return <UserOutlined style={{ fontSize: size }} />
}
