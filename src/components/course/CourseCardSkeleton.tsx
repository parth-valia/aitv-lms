// src/components/course/CourseCardSkeleton.tsx
import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';

interface CourseCardSkeletonProps {
  count?: number;
}

function SingleSkeleton() {
  return (
    <View className="bg-white rounded-2xl mb-4 overflow-hidden border border-slate-100 mx-4 p-3">
      <View className="flex-row">
        <Skeleton width={96} height={96} borderRadius={12} />
        <View className="flex-1 ml-4 justify-between">
          <View>
            <Skeleton width={60} height={16} borderRadius={6} />
            <Skeleton
              width="90%"
              height={18}
              borderRadius={6}
              style={{ marginTop: 8 }}
            />
            <Skeleton
              width="60%"
              height={14}
              borderRadius={6}
              style={{ marginTop: 6 }}
            />
          </View>
          <View className="flex-row items-center justify-between">
            <Skeleton width={50} height={14} borderRadius={6} />
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        </View>
      </View>
    </View>
  );
}

export function CourseCardSkeleton({ count = 5 }: CourseCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={`skeleton-${i}`} />
      ))}
    </>
  );
}
