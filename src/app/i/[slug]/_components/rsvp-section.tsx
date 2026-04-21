'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2Icon, HeartIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { submitRsvp } from '@/lib/actions/rsvp';

const VN_PHONE_REGEX = /^(0|\+84)(3[2-9]|5[6-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/;

const rsvpSchema = z.object({
  name: z.string().min(2, 'Vui lòng nhập tên (ít nhất 2 ký tự)'),
  phone: z.string().regex(VN_PHONE_REGEX, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  attending: z.enum(['yes', 'no']),
  adultsCount: z.number().min(1).max(10),
  childrenCount: z.number().min(0).max(10),
  message: z.string().max(500).optional(),
});

type RsvpFormValues = z.infer<typeof rsvpSchema>;

interface RsvpSectionProps {
  invitationId: string;
}

export function RsvpSection({ invitationId }: RsvpSectionProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      attending: 'yes',
      adultsCount: 1,
      childrenCount: 0,
    },
  });

  const attending = watch('attending');

  async function onSubmit(values: RsvpFormValues) {
    const result = await submitRsvp({
      invitationId,
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      attending: values.attending === 'yes',
      adultsCount: values.attending === 'yes' ? values.adultsCount : 0,
      childrenCount: values.attending === 'yes' ? values.childrenCount : 0,
      message: values.message || undefined,
    });

    if (result.error) {
      toast.error('Không thể gửi xác nhận', { description: result.error });
      return;
    }

    setSubmitted(true);
    toast.success('Cảm ơn bạn đã xác nhận!');
  }

  if (submitted) {
    return (
      <section className="py-20 px-6 md:py-28 bg-secondary/40" id="rsvp">
        <div className="mx-auto max-w-md text-center">
          <CheckCircleIcon className="mx-auto mb-4 h-16 w-16 text-green-500" />
          <h2 className="font-serif text-3xl font-light text-foreground">Cảm ơn bạn!</h2>
          <p className="mt-3 text-muted-foreground">
            Phản hồi của bạn đã được ghi nhận. Chúng mình rất mong được gặp bạn!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 md:py-28 bg-secondary/40" id="rsvp">
      <div className="mx-auto max-w-md">
        <div className="mb-12 text-center">
          <HeartIcon className="mx-auto mb-4 h-8 w-8 text-accent" />
          <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
            Xác nhận tham dự
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Vui lòng xác nhận để chúng mình có thể chuẩn bị chu đáo hơn.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Attending toggle */}
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all
              ${attending === 'yes' ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent/40'}`}>
              <input type="radio" value="yes" className="sr-only" {...register('attending')} />
              🎉 Tham dự
            </label>
            <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all
              ${attending === 'no' ? 'border-destructive/60 bg-destructive/5 text-destructive' : 'border-border text-muted-foreground hover:border-destructive/30'}`}>
              <input type="radio" value="no" className="sr-only" {...register('attending')} />
              😢 Không thể
            </label>
          </div>

          {/* Name */}
          <div className="grid gap-1.5">
            <Label htmlFor="rsvp-name">Họ và tên *</Label>
            <Input
              id="rsvp-name"
              placeholder="Nguyễn Văn A"
              {...register('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div className="grid gap-1.5">
            <Label htmlFor="rsvp-phone">Số điện thoại *</Label>
            <Input
              id="rsvp-phone"
              type="tel"
              placeholder="0901 234 567"
              {...register('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          {/* Email (optional) */}
          <div className="grid gap-1.5">
            <Label htmlFor="rsvp-email">Email (tùy chọn — để nhận xác nhận qua email)</Label>
            <Input
              id="rsvp-email"
              type="email"
              placeholder="example@email.com"
              {...register('email')}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          {/* Guest counts — only if attending */}
          {attending === 'yes' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rsvp-adults">Người lớn</Label>
                <Input
                  id="rsvp-adults"
                  type="number"
                  min={1}
                  max={10}
                  {...register('adultsCount', { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rsvp-children">Trẻ em</Label>
                <Input
                  id="rsvp-children"
                  type="number"
                  min={0}
                  max={10}
                  {...register('childrenCount', { valueAsNumber: true })}
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div className="grid gap-1.5">
            <Label htmlFor="rsvp-message">Lời nhắn gửi cặp đôi (tùy chọn)</Label>
            <Textarea
              id="rsvp-message"
              placeholder="Chúc mừng hạnh phúc! Chúng mình sẽ đến đúng giờ 😊"
              rows={3}
              {...register('message')}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              'Gửi xác nhận'
            )}
          </Button>
        </form>
      </div>
    </section>
  );
}
