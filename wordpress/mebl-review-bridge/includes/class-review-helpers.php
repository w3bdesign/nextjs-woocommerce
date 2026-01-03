<?php
/**
 * Review Helper Functions
 * 
 * Utility functions for GraphQL resolvers:
 * - Review formatting
 * - Cursor encoding/decoding
 * - Date conversion
 * 
 * @package MEBL_Review_Bridge
 * @since 1.0.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class MEBL_Review_Helpers {
    
    /**
     * Format WordPress comment as ProductReview GraphQL type
     * 
     * @param WP_Comment $comment WordPress comment object
     * @return array Formatted review data
     */
    public static function format_review($comment) {
        if (!$comment) {
            return null;
        }
        
        // Get review metadata
        $rating = (int) get_comment_meta($comment->comment_ID, 'rating', true);
        $verified = get_comment_meta($comment->comment_ID, 'verified', true) === '1';
        
        // Default to 5 if rating is missing (backward compatibility)
        if (empty($rating) || $rating < 1 || $rating > 5) {
            $rating = 5;
        }
        
        return [
            'id' => (string) $comment->comment_ID,
            'author' => $comment->comment_author,
            'content' => $comment->comment_content,
            'rating' => $rating,
            'date' => self::mysql_to_iso8601($comment->comment_date_gmt),
            'verified' => $verified,
        ];
    }
    
    /**
     * Convert MySQL datetime to ISO 8601 format
     * 
     * @param string $mysql_date MySQL datetime string
     * @return string ISO 8601 formatted date
     */
    public static function mysql_to_iso8601($mysql_date) {
        if (empty($mysql_date)) {
            return '';
        }
        
        // Use WordPress function for consistent formatting
        return mysql2date('c', $mysql_date, false);
    }
    
    /**
     * Encode pagination offset as cursor
     * 
     * @param int $offset Numeric offset
     * @return string Base64 encoded cursor
     */
    public static function encode_cursor($offset) {
        return base64_encode((string) $offset);
    }
    
    /**
     * Decode cursor to pagination offset
     * 
     * @param string $cursor Base64 encoded cursor
     * @return int Numeric offset
     */
    public static function decode_cursor($cursor) {
        if (empty($cursor)) {
            return 0;
        }
        
        $decoded = base64_decode($cursor, true);
        
        if ($decoded === false) {
            return 0;
        }
        
        return max(0, (int) $decoded);
    }
}
