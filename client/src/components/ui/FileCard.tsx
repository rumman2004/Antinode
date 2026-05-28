import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Folder, FileText, Image as ImageIcon, Film, Music, Archive, MoreVertical } from 'lucide-react-native';

interface FileCardProps {
  type: 'folder' | 'file';
  name: string;
  date: string;
  info: string;
  mimeType?: string;
  onPress: () => void;
  onLongPress?: () => void;
  viewMode?: 'list' | 'grid';
}

const FileCard = ({
  type,
  name,
  date,
  info,
  mimeType = '',
  onPress,
  onLongPress,
  viewMode = 'list',
}: FileCardProps) => {
  const getIcon = () => {
    if (type === 'folder') return <Folder size={26} color="#ffffff" />;
    if (mimeType?.startsWith('image/')) return <ImageIcon size={26} color="#ffffff" />;
    if (mimeType?.startsWith('video/')) return <Film size={26} color="#ffffff" />;
    if (mimeType?.startsWith('audio/')) return <Music size={26} color="#ffffff" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('archive')) {
      return <Archive size={26} color="#ffffff" />;
    }
    return <FileText size={26} color="#ffffff" />;
  };

  const getIconBg = () => {
    if (type === 'folder') return '#FF9500'; // Orange
    if (mimeType?.startsWith('image/')) return '#FF2D55'; // Pink/Rose
    if (mimeType?.startsWith('video/')) return '#AF52DE'; // Violet/Purple
    if (mimeType?.startsWith('audio/')) return '#34C759'; // Green
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('archive')) {
      return '#00C7BE'; // Teal
    }
    return '#007AFF'; // Blue
  };

  const iconBg = getIconBg();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[styles.card, viewMode === 'grid' && styles.cardGrid]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
    >
      {/* Icon Container with dynamic background color & glow */}
      <View style={[styles.iconContainer, { backgroundColor: iconBg, shadowColor: iconBg }, viewMode === 'grid' && styles.iconContainerGrid]}>
        {getIcon()}
      </View>
      
      {/* Details */}
      <View style={[styles.detailsContainer, viewMode === 'grid' && styles.detailsContainerGrid]}>
        <Text style={[styles.name, viewMode === 'grid' && styles.nameGrid]} numberOfLines={viewMode === 'grid' ? 2 : 1}>
          {name}
        </Text>
        <View style={[styles.metaRow, viewMode === 'grid' && styles.metaRowGrid]}>
          <Text style={[styles.date, viewMode === 'grid' && styles.dateGrid]}>{date}</Text>
          {viewMode === 'list' && (
            <>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.info}>{info}</Text>
            </>
          )}
        </View>
      </View>
      
      {/* Explicit Action Button */}
      {onLongPress && (
        <TouchableOpacity 
          style={[styles.moreBtn, viewMode === 'grid' && styles.moreBtnGrid]} 
          onPress={onLongPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={20} color="#94A3B8" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    width: '100%',
    height: 140,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 16,
  },
  iconContainerGrid: {
    marginRight: 0,
    marginBottom: 12,
    width: 54,
    height: 54,
    borderRadius: 18,
  },
  detailsContainer: {
    flex: 1,
  },
  detailsContainerGrid: {
    alignItems: 'center',
    width: '100%',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0D0D0D',
    marginBottom: 4,
  },
  nameGrid: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRowGrid: {
    justifyContent: 'center',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
  dateGrid: {
    fontSize: 11,
  },
  bullet: {
    fontSize: 12,
    color: '#8E8E93',
    marginHorizontal: 6,
  },
  info: {
    fontSize: 12,
    fontWeight: '500',
    color: '#48484A',
  },
  moreBtn: {
    padding: 8,
    marginLeft: 8,
  },
  moreBtnGrid: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 6,
  },
});

export default FileCard;

