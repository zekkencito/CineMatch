<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminMessageMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userEmail;
    public $userName;
    public $subject;
    public $messageBody;

    /**
     * Create a new message instance.
     */
    public function __construct($userName, $userEmail, $subject, $messageBody)
    {
        $this->userName = $userName;
        $this->userEmail = $userEmail;
        $this->subject = $subject;
        $this->messageBody = $messageBody;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_message',
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
