'use client';
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { createAccount, sendEmailOtp, signInUser } from '@/lib/actions/user.actions';
import OTPModal from './OTPModal';

type FormType = 'sign-up' | 'sign-in';

const authFormSchema = (formType: FormType) => {
  return z.object({
    email: z.string().email(),
    fullName:
      formType === 'sign-up'
        ? z.string().min(2).max(25)
        : z.string().optional(),
  });
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountId, setAccountId] = useState('');

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
    },
  });

  // Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setErrorMessage('');
    try {

      if (type === 'sign-up') {
        const user = await createAccount({
          fullName: values.fullName || '',
          email: values.email,
        })
        if (user?.error) {
          setErrorMessage(user?.error)
        }
        setAccountId(user.accountId);
      } else if (type === 'sign-in') {
        const user = await signInUser({ email: values.email })
        if (user?.error) {
          setErrorMessage(user?.error)
        }
        setAccountId(user.accountId);
      }
    } catch (error) {
      setErrorMessage('Faild to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="auth-form">
          <h1 className="form-title">
            {type === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </h1>
          {type === 'sign-up' && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <div className="shad-form-item">
                    <FormLabel className="shad-form-label">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter Your Full Name"
                        {...field}
                        className="shad-input"
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="shad-form-message" />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Your Email"
                      {...field}
                      className="shad-input"
                    />
                  </FormControl>
                </div>
                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="form-submit-button"
            disabled={isLoading}
          >
            {type === 'sign-in' ? 'Sign In' : 'Sign Up'}

            {isLoading && (
              <Image
                src={'/assets/icons/loader.svg'}
                alt="loader"
                width={24}
                height={24}
                className="ml-2 animate-spin"
              />
            )}
          </Button>
          {errorMessage && <p className='text-red text-2xl font-normal' >*{errorMessage}</p>}

          <div className="body-2 flex justify-center">
            <p className="text-light-100">
              {type === 'sign-in'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </p>
            <Link
              href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
              className="ml-1 font-medium text-brand"
            >
              {type === 'sign-in' ? 'sign-up' : 'sign-in'}
            </Link>
          </div>
        </form>
      </Form>

      {/* otp verification */}

      {accountId && (
        <OTPModal email={form.getValues('email')} accountId={accountId} />
      )}
    </>
  );
};

export default AuthForm;
