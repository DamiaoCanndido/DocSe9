'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, UserPlus2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type FormType = 'login' | 'register';

const userRoles = [
  { value: 'admin', label: 'ADMINISTRADOR' },
  { value: 'basic', label: 'FUNCIONÁRIO' },
];

const mockTowns = [
  {
    id: '0dfc0fff-6aef-48ad-a81d-d87c7d27a942',
    imageUrl: '',
    name: 'passagem',
    uf: 'PB',
  },
  {
    id: '0d074de9-4274-433c-8004-18f1a5054a3c',
    imageUrl: '',
    name: 'quixaba',
    uf: 'PB',
  },
];

const authFormSchema = (formType: FormType) => {
  return z
    .object({
      username:
        formType === 'register'
          ? z.string().min(3, {
              message: 'Nome de usuário deve conter no mínimo 3 caracteres.',
            })
          : z.string().optional(),
      email: z
        .email('Isso não é um e-mail válido')
        .trim()
        .min(6, { message: 'E-mail deve conter no mínimo 6 caracteres.' })
        .max(50, { message: 'O e-mail não pode exceder 50 caracteres.' }),
      remember: formType === 'login' ? z.boolean() : z.boolean().optional(),
      townId:
        formType === 'register'
          ? z.uuid({ message: 'Id da cidade inválido' }).optional()
          : z.string().optional(),
      role:
        formType === 'register'
          ? z.enum(['admin', 'basic'], { message: 'Invalid role' })
          : z.literal('basic').optional(),
      password: z.string().min(6, {
        message: 'A senha deve conter no mínimo 6 caracteres.',
      }),
      confirmPassword:
        formType === 'register'
          ? z.string().min(6, {
              message: 'A senha deve conter no mínimo 6 caracteres.',
            })
          : z.string().optional(),
    })
    .refine(
      (data) =>
        formType === 'register'
          ? data.password === data.confirmPassword
          : data.password === data.password,
      {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
      }
    )
    .refine(
      (data) => {
        if (formType === 'login') {
          return true;
        } else if (data.role === 'basic' && data.townId === undefined) {
          return false;
        }
        return true;
      },
      {
        message: 'A cidade é necessária para criar o FUNCIONÁRIO',
        path: ['townId'],
      }
    );
};

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [townsIsVisible, SetTownsVisible] = useState(false);
  const [towns, setTowns] = useState<TownResProps[]>([]);

  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      townId: undefined,
      remember: true,
      role: 'basic',
      password: '',
      confirmPassword: '',
    },
  });

  const currentRole = form.watch('role');

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        {type === 'register' && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                  Nome
                </FormLabel>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserPlus2 className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <FormControl>
                    <Input
                      placeholder="Nome"
                      className="block w-full bg-white border border-[#E0E0E0] rounded-2xl py-6 pl-12 pr-4 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none text-base"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="" />
              </FormItem>
            )}
          />
        )}
        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                Email
              </FormLabel>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
                </div>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="municipio@gov.br"
                    className="block w-full bg-white border border-[#E0E0E0] rounded-2xl py-6 pl-12 pr-4 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none text-base"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="" />
            </FormItem>
          )}
        />
        {/* Role Field */}
        {type === 'register' && (
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                  Tipo de usuário
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem
                        className="h-12.5"
                        key={role.value}
                        value={role.value}
                      >
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="" />
              </FormItem>
            )}
          />
        )}
        {/* Town Field */}
        {type === 'register' && currentRole !== 'admin' && (
          <FormField
            control={form.control}
            name="townId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                  Cidade
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma cidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockTowns.map((town) => (
                      <SelectItem
                        className="h-12.5"
                        key={town.id}
                        value={town.id}
                      >
                        {town.name} - {town.uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="" />
              </FormItem>
            )}
          />
        )}
        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between ml-1">
                <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                  Senha
                </FormLabel>
                <button
                  type="button"
                  className="text-xs cursor-pointer font-bold text-blue-600 hover:text-blue-700"
                >
                  Esqueceu?
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
                </div>
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="block w-full bg-white border border-[#E0E0E0] rounded-2xl py-6 pl-12 pr-4 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none text-base"
                    {...field}
                  />
                </FormControl>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5F6368] hover:text-blue-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <FormMessage className="" />
            </FormItem>
          )}
        />
        {/* Confirm Password Field */}
        {type === 'register' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between ml-1">
                  <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                    Confirme
                  </FormLabel>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[#5F6368] group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <FormControl>
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="block w-full bg-white border border-[#E0E0E0] rounded-2xl py-6 pl-12 pr-4 text-[#1F1F1F] placeholder-[#5F6368] focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all outline-none text-base"
                      {...field}
                    />
                  </FormControl>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#5F6368] hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <FormMessage className="" />
              </FormItem>
            )}
          />
        )}
        {/* Remember Me */}
        {type === 'login' && (
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex items-center gap-3 ml-1 py-1">
                <FormControl className="relative flex items-center">
                  <div className="w-5 h-5 rounded-md border-[#E0E0E0] text-blue-600 focus:ring-blue-200 transition-all cursor-pointer">
                    <Checkbox
                      className="cursor-pointer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                </FormControl>

                <FormLabel className="text-sm font-semibold text-[#444746] ml-1">
                  Lembrar-se
                </FormLabel>

                <FormMessage className="" />
              </FormItem>
            )}
          />
        )}
        {/* BUTTON */}
        <Button
          className="w-full cursor-pointer bg-blue-600 text-white rounded-2xl py-8 font-semibold text-base transition-all shadow-md shadow-blue-100 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : type === 'login' ? (
            'Entrar'
          ) : (
            'Criar conta'
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AuthForm;
