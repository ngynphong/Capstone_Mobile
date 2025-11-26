import { useState, useCallback } from 'react';
import ParentService from '../services/parentService';
import { updateUserProfile } from '../services/userService';
import { UpdateProfileRequest } from '../types/userTypes';
import { useAppToast } from '../utils/toast';

export const useParentProfile = () => {
    const [loading, setLoading] = useState(false);
    const toast = useAppToast();

    const updateBasicProfile = useCallback(async (profileData: UpdateProfileRequest) => {
        setLoading(true);
        try {
            await updateUserProfile(profileData);
            toast.success('Cập nhật thông tin cơ bản thành công!');
            return true;
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật thông tin cơ bản.');
            console.error('Failed to update basic profile:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const updateOccupation = useCallback(async (occupation: string) => {
        setLoading(true);
        try {
            const res = await ParentService.updateParentProfile({ occupation });
            if (res.data.code === 0 || res.data.code === 1000) {
                toast.success('Cập nhật nghề nghiệp thành công!');
                return true;
            } else {
                toast.error(res.data.message || 'Cập nhật thất bại.');
                return false;
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi cập nhật.');
            console.error('Failed to update occupation:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    return {
        loading,
        updateBasicProfile,
        updateOccupation,
    };
};
