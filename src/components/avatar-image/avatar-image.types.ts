export interface AvatarImageProps {
  /** Stored avatar value: image path, http URL, or empty/undefined for fallback */
  readonly avatar?: string
  /** Avatar size in pixels (default 36) */
  readonly size?: number
  /** Additional CSS classes */
  readonly className?: string
}
