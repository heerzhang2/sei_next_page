'use client';

// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { User } from 'next-auth';
import { useState } from 'react';
// import { useToast } from '@/hooks/use-toast';
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/component/ui/form';
// import { Input } from '@/component/ui/input';
// import { Button } from '@/component/ui/button';
import { updateUserProfile } from '@/action/user';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileForm({ user }: { user: User }) {
  // const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // const form = useForm<ProfileFormValues>({
  //   // resolver: zodResolver(profileFormSchema),
  //   defaultValues: {
  //     name: user.name || '',
  //     email: user.email || '',
  //   },
  // });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    try {
      if (!user.id) throw new Error('User ID is required');
      await updateUserProfile(user.id, data);
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }

  return (
      <form onSubmit={onSubmit} className="space-y-4">
          <div name="name"
          />
          <br/>
          <div
              name="email"
          />
          <br/>
          <div type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
          </div>
      </form>
  );
}
