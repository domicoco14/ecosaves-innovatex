import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const AvatarStack = ({ members = [], limit = 4, size = 32 }) => {
  const displayMembers = members.slice(0, limit);
  const remaining = members.length > limit ? members.length - limit : 0;

  const defaultInitials = ['JD', 'AO', 'FK', 'CI', 'MT'];

  return (
    <View style={styles.container}>
      {displayMembers.map((member, index) => {
        const initials = member.initials || defaultInitials[index % defaultInitials.length];
        const bgColor = member.color || ['#005B7F', '#E98591', '#29875A', '#B78103'][index % 4];

        return (
          <View
            key={index}
            style={[
              styles.avatarCircle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: bgColor,
                marginLeft: index === 0 ? 0 : -10,
              },
            ]}
          >
            <Text style={[styles.initialsText, { fontSize: size * 0.38 }]}>{initials}</Text>
          </View>
        );
      })}

      {remaining > 0 && (
        <View
          style={[
            styles.avatarCircle,
            styles.moreCircle,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -10,
            },
          ]}
        >
          <Text style={[styles.moreText, { fontSize: size * 0.35 }]}>+{remaining}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreCircle: {
    backgroundColor: '#737980',
  },
  initialsText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  moreText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
