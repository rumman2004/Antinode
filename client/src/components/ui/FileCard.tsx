import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Folder, FileText, Image as ImageIcon, Film, Music, Archive, MoreVertical } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();

  const getIcon = () => {
    if (type === 'folder') return <Folder size={24} color="#FFFFFF" />;
    if (mimeType?.startsWith('image/')) return <ImageIcon size={24} color="#FFFFFF" />;
    if (mimeType?.startsWith('video/')) return <Film size={24} color="#FFFFFF" />;
    if (mimeType?.startsWith('audio/')) return <Music size={24} color="#FFFFFF" />;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('archive')) {
      return <Archive size={24} color="#FFFFFF" />;
    }
    return <FileText size={24} color="#FFFFFF" />;
  };

  const getIconBg = () => {
    if (type === 'folder') return colors.amber;
    if (mimeType?.startsWith('image/')) return '#B5545B';
    if (mimeType?.startsWith('video/')) return '#7B5EA7';
    if (mimeType?.startsWith('audio/')) return colors.successGreen;
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('archive')) {
      return '#5A8A7A';
    }
    return colors.brass;
  };

  const iconBg = getIconBg();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.cream,
          borderColor: colors.cardBorder,
          shadowColor: colors.walnut,
        },
        viewMode === 'grid' && styles.cardGrid,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
    >
      {/* Embossed top edge */}
      <View style={[styles.topEdge, { backgroundColor: colors.emboss }]} />

      {/* Icon Container with glossy dome effect */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: iconBg, shadowColor: iconBg },
          viewMode === 'grid' && styles.iconContainerGrid,
        ]}
      >
        {/* Glossy shine */}
        <View style={styles.iconShine} />
        {getIcon()}
      </View>
      
      {/* Details */}
      <View style={[styles.detailsContainer, viewMode === 'grid' && styles.detailsContainerGrid]}>
        <Text
          style={[styles.name, { color: colors.text }, viewMode === 'grid' && styles.nameGrid]}
          numberOfLines={viewMode === 'grid' ? 2 : 1}
        >
          {name}
        </Text>
        <View style={[styles.metaRow, viewMode === 'grid' && styles.metaRowGrid]}>
          <Text style={[styles.date, { color: colors.textMuted }, viewMode === 'grid' && styles.dateGrid]}>
            {date}
          </Text>
          {viewMode === 'list' && (
            <>
              <Text style={[styles.bullet, { color: colors.textMuted }]}>•</Text>
              <Text style={[styles.info, { color: colors.textSecondary }]}>{info}</Text>
            </>
          )}
        </View>
      </View>
      
      {/* Brass rivet more button */}
      {onLongPress && (
        <TouchableOpacity 
          style={[
            styles.moreBtn,
            viewMode === 'grid' && styles.moreBtnGrid,
          ]} 
          onPress={onLongPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreVertical size={18} color={colors.brass} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    marginRight: 14,
    overflow: 'hidden',
  },
  iconContainerGrid: {
    marginRight: 0,
    marginBottom: 10,
    width: 50,
    height: 50,
    borderRadius: 16,
  },
  iconShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
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
    marginBottom: 3,
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
  },
  dateGrid: {
    fontSize: 11,
  },
  bullet: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  info: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreBtn: {
    padding: 8,
    marginLeft: 4,
  },
  moreBtnGrid: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 6,
  },
});

export default FileCard;
