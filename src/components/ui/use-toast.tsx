import { toast } from 'sonner'

export const useToast = () => {
  return {
    toast: (props: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
      toast[props.variant === 'destructive' ? 'error' : 'success'](props.title, {
        description: props.description,
      })
    },
  }
}
